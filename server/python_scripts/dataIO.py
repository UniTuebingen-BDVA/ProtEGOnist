# read in the ego pickle files
from os import name
import pickle
import pathlib
import networkx as nx
import pandas as pd
import numpy as np
import gzip
from server.python_scripts.egoGraph import EgoGraph


def read_ego_pickles(data_path: pathlib.Path):
    nxEgoGraphs = {}

    for i in range(0, 2500, 500):
        # open the pickle files and join them in one dictionary
        with open(data_path / "ego_dict_deg2_{}.pickle".format(str(i)), "rb") as handle:
            egoGraphs = pickle.load(handle)
            nxEgoGraphs.update(egoGraphs)

    # convert the dictionary to a dictionary of egoGraph objects
    nxEgoGraphs = {
        i: EgoGraph.from_created_egonetwork(i, nxEgoGraphs[i]) for i in nxEgoGraphs
    }

    return nxEgoGraphs


# a function that reads in an excel sheet and returns a dictionary of the sheets content
# a row is a dictionary with the column names as keys and the values of the row as values
# the columns are defined by a dictionary with the keys "field" and " headerName" represting the name and display name of the column respectively
# the first row of the excel sheet is the header row


def read_excel_sheet(path: pathlib.Path, sheet_name: str | int):
    """
    Read in an excel sheet and return a dictionary of the sheets content

    :param path: path to the excel sheet
    :return: dictionary of the sheets content
    """
    df = pd.read_excel(path, header=0, sheet_name=sheet_name)
    df = df.where(pd.notnull(df), None)
    # get the column names
    columns = df.columns
    # convert the dataframe to a list of dictionaries
    rows_as_dict = df.to_dict(orient="records")
    # add a field ("id") to each row that contains the index+1 of the row
    for i in range(len(rows_as_dict)):
        rows_as_dict[i]["id"] = i + 1
    cols = [{"field": field, "headerName": field, "width": 150} for field in columns]

    return {"rows": rows_as_dict, "columns": cols}


def parse_distance_matrix(path: pathlib.Path, top_intersections: int = 25):
    distance_matrix = np.loadtxt(path, delimiter="\t")
    print("Loaded distance matrix ", distance_matrix.shape)
    # get the header from possible gzip file
    if path.suffix == ".gz":
        with gzip.open(path, "rt") as f:
            header = f.readline().strip().split("\t")[1:]
    else:
        with open(path, "r") as f:
            header = f.readline().strip().split("\t")[1:]
    # get the top intersections
    top_intersections_dict = {}
    for i in range(len(header)):
        indices_to_get = np.argsort(distance_matrix[i, :])[-top_intersections - 1 :]
        indices_to_get = np.delete(
            indices_to_get, np.where(indices_to_get == i)
        )  # remove the node itself
        top_intersections_dict[header[i]] = {
            header[index]: distance_matrix[i, index] for index in indices_to_get
        }

    return top_intersections_dict


def read_metadata(path, classification, all_nodes, sep=","):
    all_nodes = set(all_nodes)
    with open(path, "r") as f:
        # read the metadata table into a dictionary,
        # the key is the node id(col0) and the value is the metadata in a dictionary with the key from header
        table_data = {
            "columns": f.readline().strip().split(sep)
            + ["with_metadata", "found_in_network"]
        }
        table_data_temp = {
            line.strip().split(sep)[0]: {
                name: is_number(value)
                for name, value in zip(
                    table_data["columns"],
                    line.strip().split(sep)
                    + [True, line.strip().split(sep)[0] in all_nodes],
                )
            }
            for line in f
        }
    table_data["columns"] = [
        {"field": field, "headerName": field, "width": 150}
        for field in table_data["columns"]
    ]
    table_data["rows"] = table_data_temp
    classification_dict = {
        key: value[classification] for key, value in table_data["rows"].items()
    }
    nodes_with_metadata = set(table_data_temp.keys())
    # get the nodes without metadata
    nodes_without_metadata = all_nodes.difference(nodes_with_metadata)
    # add the nodes without metadata to the table
    for node in nodes_without_metadata:
        # none_data = {name: None for name in table_data["columns"][1:-1]}
        table_data_temp[node] = {"with_metadata": False, "nodeID": node}

    table_data["rows"] = table_data_temp

    return table_data, classification_dict


# a function that checks if a string is a float or an int and returns the value as the correct type if possible
def is_number(s):
    if type(s) == bool:
        return str(s)
    try:
        return float(s)
    except ValueError:
        pass
    try:
        return int(s)
    except ValueError:
        pass
    return s
