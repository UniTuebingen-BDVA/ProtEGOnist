import json
import pathlib
import networkx as nx
from flask import Flask, request
import tempfile
import uuid
import traceback

from server.python_scripts.example_reading import (
    read_example_string,
    read_example_IEEEcoAuthor,
    read_example_ecoli_full,
)
from server.python_scripts.sampleGraph import (
    generate_string_intersections_top,
    generate_radar_data,
    generate_ego_graph_bundle,
)
from server.python_scripts.egoNetworkNetwork import EgoNetworkNetwork
from server.python_scripts.egoGraph import EgoGraph
from server.python_scripts.input_parsing import create_data_network

def get_and_save_path(data, key):
    file = data.get(key)
    if file is None:
        return None
    file_path = pathlib.Path(tempfile.gettempdir()) / file.filename
    file.save(file_path)
    return str(file_path)

def create_app(input_path=""):
    dev_Flag = True
    DATA_PATH = pathlib.Path(input_path)
    app = Flask(__name__, static_folder="../dist", static_url_path="/")

    DATA_LOADED = {
        # "string": read_example_string(DATA_PATH),
        # "IEEE": read_example_IEEEcoAuthor(DATA_PATH),
        # "ecoli": read_example_ecoli_full(DATA_PATH),
    }


    @app.route("/api/process_input_data", methods=["POST"])
    def process_input_data():
        try:
            # create random id for key in dictionary
            random_id = str(uuid.uuid4())

            data = request.files
            network_file_path = get_and_save_path(data, "network")
            metadata_file_path = get_and_save_path(data, "metadata")
            nodes_file_path = get_and_save_path(data, "nodes_interest")
                        
            max_nodes = int(request.form.get("max_nodes"))
            min_coverage = float(request.form.get("min_coverage"))

            key_classification = request.form.get("key_classification").strip()
            key_classification = key_classification if key_classification != "" else "number_of_nodes"
            key_node_name = request.form.get("key_node_name").strip()
            keys_tooltip_info = request.form.get("keys_tooltip_info").strip()
            print(f"keys_tooltip_info: {keys_tooltip_info}")
            # string to array, replace "[" or "]" and split by ","
            keys_tooltip_info = keys_tooltip_info.replace('"',"").replace("[", "").replace("]", "").split(",")
            print(f"keys_tooltip_info: {keys_tooltip_info}")
            app.logger.info(f"max_nodes: {max_nodes}, min_coverage: {min_coverage}")            
            network_data_files = create_data_network(network_file_path, metadata_file_path, nodes_file_path, max_nodes, min_coverage, key_classification)

            network_data_client = {
                "name_nodes": key_node_name if key_node_name != "" else "nodeID",
                "classify_by": key_classification,
                "quantify_by": "default",
                "quantify_type": "quantitative",
                "show_tooltip": keys_tooltip_info if len(keys_tooltip_info)>0 else ["number_of_nodes"],
            }

            # Combine the two dictionaries
            network_data = {**network_data_files, **network_data_client}
            DATA_LOADED[random_id] = network_data
            return random_id
        except Exception:
            print(traceback.format_exc())
            return "Error"
        

    @app.route("/api/get_labelling_keys/<example>", methods=["GET"])
    def get_labelling_keys(example: str):
        try:
            example_data = DATA_LOADED[example]
            labelling_keys = {
                "nameNodesBy": example_data["name_nodes"],
                "classifyBy": example_data["classify_by"],
                "showOnTooltip": example_data["show_tooltip"],
                "quantifyBy": {
                    "label": example_data["quantify_by"],
                    "type": example_data["quantify_type"],
                },
                "startRadarNode": example_data["start_radar"],
                "startSelectedNodes": example_data["start_selected"],
            }
            # check if example_data has the key "edges_classification"
            if "edges_classification" in example_data:
                labelling_keys["edgesClassification"] = example_data[
                    "edges_classification"
                ]
        except KeyError:
            print(f"Example {example} not found")
        except Exception as e:
            print(e)

        return json.dumps(labelling_keys)

    # ROUTES

    @app.route("/api/backendcounter", methods=["POST"])
    def test():
        counter = int(request.form.to_dict()["counter"])
        return str(counter + 1)

    @app.route("/api/egograph_bundle", methods=["POST"])
    def test_data_egograph_bundle():
        example = request.json["example"]
        string_graph = DATA_LOADED[example]["network"]
        target_nodes = request.json["ids"]
        json_data = generate_ego_graph_bundle(string_graph, target_nodes)
        return json_data

    @app.route("/")
    def index():
        return app.send_static_file("index.html")

    @app.route("/api/EgoRadar/<example>/<targetNode>", methods=["GET"])
    def get_ego_radar(example: str, targetNode: str):
        """
        Generate a test ego radar plot using nx.gorogovtsev_goltsev_mendes_graph and generating 40 ego networks from it.
        """
        top_intersections = DATA_LOADED[example]["top_intersections"]
        uniprot_brite_dict = DATA_LOADED[example]["classification"]
        string_graph = DATA_LOADED[example]["network"]
        if dev_Flag:
            # get top intersections for target node
            intersections = top_intersections[targetNode]
            # get the ids of the top intersections
            ids = list(intersections.keys())
            tar_ego_graph, rest_ego_graphs = generate_string_intersections_top(
                string_graph, ids, targetNode, uniprot_brite_dict
            )
        else:
            tar_ego_graph, rest_ego_graphs = generate_radar_data(
                string_graph, targetNode, uniprot_brite_dict
            )
            ids = list(rest_ego_graphs.keys())
        intersection_dict = {
            i: rest_ego_graphs[i].get_intersection(tar_ego_graph) for i in ids
        }
        intersection_dict[targetNode] = tar_ego_graph.get_intersection(tar_ego_graph)

        return json.dumps(intersection_dict)

    @app.route("/api/getTableData/<dataID>", methods=["GET"])
    def get_table_data(dataID: str):
        return json.dumps(DATA_LOADED[dataID]["metadata"])

    @app.route("/api/getEgoNetworkNetwork/<example>/<targetNodes>", methods=["GET"])
    def get_ego_network_network(example: str, targetNodes: str):
        """
        Generate a network of ego networks from the target nodes.
        """
        string_graph = DATA_LOADED[example]["network"]
        split_target = targetNodes.split("+")
        ego_network_network = get_ego_network(string_graph, split_target)
        return ego_network_network.get_graph_json()

    @app.route("/api/getNodeLinkDiagram/", methods=["POST"])
    def get_node_link_diagram():
        """
        Generate a node link diagram from the target nodes.
        """
        complete_graph = DATA_LOADED[request.json["example"]]["network"]
        target_nodes = request.json["ids"]
        # get the subgraph of the target nodes in the complete graph
        subgraph = complete_graph.subgraph(target_nodes)
        # components
        components = [
            subgraph.subgraph(c).copy()
            for c in sorted(nx.connected_components(subgraph), key=len, reverse=True)
        ]
        #
        out_data = [
            {
                "nodes": list(comp.nodes),
                "edges": list(comp.edges),
            }
            for comp in components
        ]
        return out_data

    @app.route("/api/getEgoNetworkNetworkOverview/<example>", methods=["GET"])
    def get_ego_network_network_overview(example: str):
        """
        Generate a network of ego networks from the target nodes.
        """
        string_graph = DATA_LOADED[example]["network"]
        overview_nodes = DATA_LOADED[example]["overview_nodes"]
        ego_networks = get_ego_network(string_graph, overview_nodes, True)
        return json.dumps(
            {
                "network": ego_networks["graph"].get_graph_json(),
                "coverage": ego_networks["coverage"],
                "overviewNodes": overview_nodes,
            }
        )

    def get_ego_network(string_graph, split_target, coverage=False):
        if coverage:
            ego_networks = []
            covered_edges = set()
            covered_nodes = set()

            for ego_center in split_target:
                ego_network_temp = EgoGraph.from_string_network(
                    ego_center, string_graph
                )
                ego_networks.append(ego_network_temp)
                covered_edges.update(ego_network_temp.get_edge_set())
                covered_nodes.update(ego_network_temp.get_node_set())

            coverage = {
                "nodes": len(covered_nodes) / len(string_graph.nodes),
                "edges": len(covered_edges) / len(string_graph.edges),
            }
            ego_network_network = EgoNetworkNetwork(ego_networks)

            return {"graph": ego_network_network, "coverage": coverage}
        else:
            return EgoNetworkNetwork(
                [EgoGraph.from_string_network(i, string_graph) for i in split_target]
            )

    return app
