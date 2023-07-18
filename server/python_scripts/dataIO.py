# read in the ego pickle files
import pickle
import pathlib
import networkx as nx
from server.python_scripts.egoGraph import egoGraph


def read_Ego_Pickles(data_path: pathlib.Path):
    nxEgoGraphs = {}

    for i in range(0, 2500, 500):
        # open the pickle files and join them in one dictionary
        with open(data_path / "ego_dict_deg2_{}.pickle".format(str(i)), "rb") as handle:
            egoGraphs = pickle.load(handle)
            nxEgoGraphs.update(egoGraphs)

    # convert the dictionary to a dictionary of egoGraph objects
    nxEgoGraphs = {
        i: egoGraph.fromCreatedEgonetwork(i, nxEgoGraphs[i]) for i in nxEgoGraphs
    }

    return nxEgoGraphs
