# read in the ego pickle files
import pickle
import pathlib
import networkx as nx
import pandas as pd
import json
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
    cols = [{"field": field, "headerName": field, "width": 150}
            for field in columns]

    return {"rows": rows_as_dict, "columns": cols}
