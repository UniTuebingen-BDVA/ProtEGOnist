import os
import pathlib
import json
from flask import Flask, request
import json
import networkx as nx
from server.python_scripts.dataIO import read_Ego_Pickles
from server.python_scripts.sampleGraph import (
    generateTestGraphDataNew,
    generateTestGraphData,
)

global stringGraph

dev_Flag = False
app = Flask(__name__, static_folder="../dist", static_url_path="/")
here: pathlib.Path = pathlib.Path(__file__).parent.absolute()

stringGraph = nx.read_graphml(here.parent / "data" / "graphml_string_cleaned.graphml")
if dev_Flag:
    egoDictGraph = read_Ego_Pickles(here.parent / "data")


## ROUTES
@app.route("/api/backendcounter", methods=["POST"])
def test():
    counter = int(request.form.to_dict()["counter"])
    return str(counter + 1)


@app.route("/api/test_data_egograph", methods=["GET"])
def test_data_egograph():
    with open(os.path.join(here, "data", "ego_example.json")) as f:
        data = json.load(f)
    return data


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/api/testEgoRadar", methods=["GET"])
def testEgoRadar():
    """
    Generate a test ego radar plot using nx.gorogovtsev_goltsev_mendes_graph and generating 40 ego networks from it.
    """
    # select random key from egoDictGraph

    if dev_Flag:
        ids = list(egoDictGraph.keys())
        tar_node = ids[0]
        ids, test_ego_networks = generateTestGraphDataNew(egoDictGraph, tar_node)
    else:
        ids, test_ego_networks = generateTestGraphData()
        tar_node = ids[0]

    # if not request.json:
    #     tar_node = ids[0]
    # else:
    #     tar_node = request.json["tarNode"]
    # get the intersection of target node and the ids
    intersection_dict = {
        i: test_ego_networks[i].getIntersection(test_ego_networks[tar_node])
        for i in ids
    }
    print(intersection_dict)

    return json.dumps({"intersectionData": intersection_dict, "tarNode": tar_node})
