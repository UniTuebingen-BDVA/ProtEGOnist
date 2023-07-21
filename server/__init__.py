import os
import pathlib
import json
import random
from flask import Flask, request
import json
import networkx as nx
from server.python_scripts.dataIO import read_ego_pickles, read_excel_sheet
from server.python_scripts.sampleGraph import (
    generate_string_intersections,
    generate_radar_data,
    generate_dgm_ego_graph,
    generate_random_ego_graph_string,
)

global string_graph
global testing_tar_node

dev_Flag = False
app = Flask(__name__, static_folder="../dist", static_url_path="/")
here: pathlib.Path = pathlib.Path(__file__).parent.absolute()

try:
    random.seed(31)
    string_graph = nx.read_graphml(here / "data" / "graphml_string_cleaned.graphml")
    # pick a random node from the graph as the testing_tar_node
except FileNotFoundError:
    print(f"No graphml file found in {here / 'data'}. Make sure you added it.")

if dev_Flag:
    try:
        ego_dict_graph = read_ego_pickles(here / "data")
    except FileNotFoundError:
        print(f"No ego pickles found in {here / 'data'}. Make sure you added them.")


## ROUTES
@app.route("/api/backendcounter", methods=["POST"])
def test():
    counter = int(request.form.to_dict()["counter"])
    return str(counter + 1)


@app.route("/api/test_data_egograph/<targetNode>", methods=["GET"])
def test_data_egograph(targetNode: str):
    json_data = generate_random_ego_graph_string(string_graph, targetNode)
    return json_data


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/api/testEgoRadar/<targetNode>", methods=["GET"])
def test_ego_radar(targetNode: str):
    """
    Generate a test ego radar plot using nx.gorogovtsev_goltsev_mendes_graph and generating 40 ego networks from it.
    """
    # select random key from egoDictGraph

    if dev_Flag:
        ids = list(ego_dict_graph.keys())
        ids, rest_ego_graphs = generate_string_intersections(ego_dict_graph, targetNode)
        tar_ego_graph = rest_ego_graphs[targetNode]
    else:
        tar_ego_graph, rest_ego_graphs = generate_radar_data(string_graph, targetNode)
        ids = list(rest_ego_graphs.keys())

    # if not request.json:
    #     tar_node = ids[0]
    # else:
    #     tar_node = request.json["tarNode"]
    # get the intersection of target node and the ids
    intersection_dict = {
        i: rest_ego_graphs[i].get_intersection(tar_ego_graph) for i in ids
    }
    intersection_dict[targetNode] = tar_ego_graph.get_intersection(tar_ego_graph)
    # print(intersection_dict)

    return json.dumps(intersection_dict)


@app.route("/api/getTableData", methods=["GET"])
def get_table_data():
    table_data = read_excel_sheet(here / "data" / "s5_with_uniprot.xlsx", 0)
    return table_data
