import os
from flask import Flask, request
import json
from server.python_scripts.sampleGraph import generateTestGraphData

app = Flask(__name__, static_folder='../dist', static_url_path='/')
here = os.path.dirname(__file__)


## ROUTES
@app.route('/api/backendcounter', methods=['POST'])
def test():
    counter = int(request.form.to_dict()['counter'])
    return str(counter+1)


@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route("/api/testEgoRadar", methods=["POST", "GET"])
def testEgoRadar():
    """
    Generate a test ego radar plot using nx.gorogovtsev_goltsev_mendes_graph and generating 40 ego networks from it.
    """

    ids, test_ego_networks = generateTestGraphData()
    if not request.json:
        tar_node = ids[0]
    else:
        tar_node = request.json["tarNode"]
    # get the intersection of target node and the ids
    intersection_dict = {i: test_ego_networks[i].getIntersection(tar_node) for i in ids}

    return json.dumps(intersection_dict)