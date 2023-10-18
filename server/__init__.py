import json
import pathlib
import pickle
from matplotlib.pyplot import table
import networkx as nx
from flask import Flask, request


from server.python_scripts.dataIO import read_metadata
from server.python_scripts.sampleGraph import (
    generate_string_intersections_top,
    generate_radar_data,
    generate_random_ego_graph_string,
    generate_ego_graph_bundle,
)
from server.python_scripts.egoNetworkNetwork import EgoNetworkNetwork
from server.python_scripts.egoGraph import EgoGraph

global string_graph
global top_intersections
global uniprot_brite_dict

dev_Flag = True
app = Flask(__name__, static_folder="../dist", static_url_path="/")
here: pathlib.Path = pathlib.Path(__file__).parent.absolute()

EXAMPLES = {}


def read_example_string():
    # Read the STRING network from the input file
    try:
        network = nx.read_graphml(
            here / "data" / "example_PPIs" / "graphml_string_cleaned.graphml")
        print("Loaded string graph ", len(network.nodes))
    except FileNotFoundError:
        print(
            f"No graphml file found in {here / 'data'}. Make sure you added it.")
    # Read the top intersections from the input file
    try:
        with open(here / "data" / "example_PPIs" / "intersections_ego_deg2.pickle", "rb") as f:
            top_intersections = pickle.load(f)
            print("Loaded intersections ", len(top_intersections))
    except FileNotFoundError:
        print(
            f"No json file found in {here / 'data'}. Make sure you added it.")
    try:
        table_data, classification_dict = read_metadata(
            here / "data" / "example_PPIs" / "metadata_proteins.csv", "brite")

    except FileNotFoundError:
        print(
            f"No metadata file found in {here / 'data'}. Make sure you added it.")

    try:
        with open(here / "data" / "example_PPIs" / "important_nodes.txt", "r") as f:
            important_nodes = [line.strip() for line in f]
            print("Loaded relevant_proteins ", len(important_nodes))

    except FileNotFoundError:
        print(
            f"No metadata file found in {here / 'data'}. Make sure you added it.")

    EXAMPLES["string"] = {
        "network": network,
        "top_intersections": top_intersections,
        "classification": classification_dict,
        "metadata": table_data,
        "overview_nodes": important_nodes,
    }


def read_example_string_modified():
    # Read the STRING network from the input file
    try:
        network = nx.read_graphml(
            here / "data" / "example_PPIs2" / "graphml_string_cleaned.graphml")
        print("Loaded string graph ", len(network.nodes))
    except FileNotFoundError:
        print(
            f"No graphml file found in {here / 'data'}. Make sure you added it.")
    # Read the top intersections from the input file
    try:
        with open(here / "data" / "example_PPIs2" / "intersections_ego_deg2.pickle", "rb") as f:
            top_intersections = pickle.load(f)
            print("Loaded intersections ", len(top_intersections))
    except FileNotFoundError:
        print(
            f"No json file found in {here / 'data'}. Make sure you added it.")
    try:
        table_data, classification_dict = read_metadata(
            here / "data" / "example_PPIs2" / "metadata_proteins.csv", "x_id")

    except FileNotFoundError:
        print(
            f"No metadata file found in {here / 'data'}. Make sure you added it.")

    try:
        with open(here / "data" / "example_PPIs2" / "important_nodes.txt", "r") as f:
            important_nodes = [line.strip() for line in f]
            print("Loaded relevant_proteins ", len(important_nodes))

    except FileNotFoundError:
        print(
            f"No metadata file found in {here / 'data'}. Make sure you added it.")

    EXAMPLES["string_modified"] = {
        "network": network,
        "top_intersections": top_intersections,
        "classification": classification_dict,
        "metadata": table_data,
        "overview_nodes": important_nodes,
    }


read_example_string()
read_example_string_modified()


# @app.route("/api/getExample/<case>", methods=["GET"])
# def read_example(case: str):
#     print("Reading example data")
#     if case == "string":
#         print("Reading string data")
#         print("Loaded string graph ", len(string_graph.nodes))
#     return json.dumps(True)


# ROUTES
@app.route("/api/backendcounter", methods=["POST"])
def test():
    counter = int(request.form.to_dict()["counter"])
    return str(counter + 1)


@app.route("/api/test_data_egograph/<targetNode>", methods=["GET"])
def test_data_egograph(targetNode: str):
    json_data = generate_random_ego_graph_string(string_graph, targetNode)
    return json_data


@app.route("/api/egograph_bundle", methods=["POST"])
def test_data_egograph_bundle():
    example = request.json["example"]
    string_graph = EXAMPLES[example]["network"]
    target_nodes = request.json["ids"]
    json_data = generate_ego_graph_bundle(string_graph, target_nodes)
    return json_data


@app.route("/")
def index():
    return app.send_static_file("index.html")

# @app.route("/api/ParseNetwork/", methods=["POST"])
# def parse_network():
#     """
#     Parse the network from the input file.
#     """
#     # Read the network from the input file
#     # TODO: different file formats (graphml, tsv, csv, ...)
#     network = nx.read_weighted_edgelist(request.files["network"].stream, delimiter="\t")
#     # TODO: Set string_graph variable from network
#     # string_graph = network
#     # TODO: compute all interactions of egographs
#     # TODO: start with the computation of the intersection of the egographs with each other
#     return json.dumps(list(network.nodes))

# @app.route("/api/ParseNodesInterest/", methods=["POST"])
# def parse_nodes_interest():
#     """
#     Parse the nodes of interest from the input file.
#     """
#     # Read the nodes of interest from the input file
#     subset_nodes = {}
#     input_file = request.files["nodesInterest"]
#     header = False
#     for line in input_file.stream.read().decode().splitlines():
#         if not header:
#             header = True
#             names_cols = line.strip().split("\t")[1:]
#             continue
#         parsed_line = line.strip().split("\t")
#         if len(parsed_line) > 1:
#             key, values = parsed_line[0], parsed_line[1:]
#             subset_nodes[key] = {name: value for name, value in zip(names_cols, values)}
#         else:
#             key = parsed_line[0]
#             subset_nodes[key] = {}
#     return json.dumps(list(subset_nodes.keys()))


@app.route("/api/EgoRadar/<example>/<targetNode>", methods=["GET"])
def get_ego_radar(example: str, targetNode: str):
    """
    Generate a test ego radar plot using nx.gorogovtsev_goltsev_mendes_graph and generating 40 ego networks from it.
    """
    top_intersections = EXAMPLES[example]["top_intersections"]
    uniprot_brite_dict = EXAMPLES[example]["classification"]
    string_graph = EXAMPLES[example]["network"]
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
    intersection_dict[targetNode] = tar_ego_graph.get_intersection(
        tar_ego_graph)

    return json.dumps(intersection_dict)


@app.route("/api/getTableData/<type>", methods=["GET"])
def get_table_data(type: str):
    return json.dumps(EXAMPLES[type]["metadata"])


@app.route("/api/getEgoNetworkNetwork/<example>/<targetNodes>", methods=["GET"])
def get_ego_network_network(example: str, targetNodes: str):
    """
    Generate a network of ego networks from the target nodes.
    """
    string_graph = EXAMPLES[example]["network"]
    split_target = targetNodes.split("+")
    ego_network_network = get_ego_network(string_graph, split_target)
    return ego_network_network.get_graph_json()


@app.route("/api/getEgoNetworkNetworkOverview/<example>", methods=["GET"])
def get_ego_network_network_overview(example: str):
    """
    Generate a network of ego networks from the target nodes.
    """
    string_graph = EXAMPLES[example]["network"]
    overview_nodes = EXAMPLES[example]["overview_nodes"]
    return json.dumps({"network": get_ego_network(string_graph, overview_nodes).get_graph_json(),
                       "overviewNodes": overview_nodes})


def get_ego_network(string_graph, split_target):
    ego_networks = [EgoGraph.from_string_network(
        i, string_graph) for i in split_target]
    ego_network_network = EgoNetworkNetwork(ego_networks)
    return ego_network_network
