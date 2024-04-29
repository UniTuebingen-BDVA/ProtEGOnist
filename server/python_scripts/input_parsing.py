import numpy as np
from server.python_scripts.utilities_preprocessing.generate_ego_graphs import (
    create_ego_graphs_dicts_for_network,
    create_ego_graphs_for_network,
    ego_graphs_to_metadata,
    read_graphml_to_network,
    read_tsv_to_network,
)
from server.python_scripts.dataIO import is_number

from server.python_scripts.utilities_preprocessing.generate_distance_matrix import (
    create_distance_matrix_from_dict
)

from server.python_scripts.utilities_preprocessing.generate_overview_nodes import (
    heuristic_set_cover
)


from networkx import Graph
import pandas as pd

def parse_network(network_path: str) -> Graph:
    """
    Parse the network from the given path.

    Args:
        network_path (str): The path to the network file.

    Returns:
        Graph: The parsed network as a Graph object.
    """
    if network_path.endswith(".tsv"):
        network = read_tsv_to_network(network_path)
    elif network_path.endswith(".graphml"):
        network = read_graphml_to_network(network_path)
    return network

def create_ego_graphs(network: Graph) -> tuple:
    """
    Create an ego graph for each node in a networkX element.

    Args:
        network (Graph): The input network.

    Returns:
        dict: A dictionary containing ego graphs for each node in the network.
    """
    ego_graphs = create_ego_graphs_for_network(network)
    egp_graphs_as_dicts = create_ego_graphs_dicts_for_network(ego_graphs)
    return ego_graphs, egp_graphs_as_dicts

def create_metadata(ego_graphs: dict, metadata_path: str, separator: str) -> pd.DataFrame:
    """
    Add metadata derived from ego graphs to a metadata data.

    Args:
        ego_graphs (dict): A dictionary containing ego graphs for each node.
        metadata_path (str): The path to the metadata file.
        separator (str): The separator used in the metadata file.

    Returns:
        dict: A dictionary containing metadata derived from ego graphs.
    """
    if metadata_path != None:
        metadata = pd.read_csv(metadata_path, 
            index_col=0,
            sep=separator,
            encoding="utf-8"
        )
        metadata.index = metadata.index.astype(str)
    else:
        metadata = pd.DataFrame()
    return ego_graphs_to_metadata(ego_graphs, metadata)
def parse_nodes_start(nodes_to_start: str) -> list:
    """
    Parse the nodes to start from the given string.

    Args:
        nodes_to_start (str): The string containing the nodes to start.

    Returns:
        list: A list of nodes to start.
    """
    if nodes_to_start == None:
        return None
    with open(nodes_to_start, "r") as f:
        nodes_to_start = f.read()

    return nodes_to_start.strip().split("\n") if nodes_to_start != None else None
def create_set_overview_nodes(network: Graph, ego_graphs: dict, nodes_to_account: list = None, nodes_to_start: list = None, max_nodes: int = 100, min_edge_coverage: float = 0.99) -> list:
    """
    Create a set of overview nodes based on the network, ego graphs, and nodes to account.

    Args:
        network (Graph): The input network.
        ego_graphs (dict): A dictionary containing ego graphs for each node.
        nodes_to_account (list): A list of nodes to account for, for example, those with metadata.
        nodes_to_start (list): A list of nodes that must be in the overview.
        max_nodes (int): The maximum number of nodes in the overview.
        min_edge_coverage (float): The minimum edge coverage for the overview.

    Returns:
        list: A list of overview nodes.
    """
    adapted_ego_graphs = {node: ego_graphs[node]["edges"] for node in ego_graphs.keys()}
    # Get Edges of network
    network_edges = set([tuple(sorted([edge[0],edge[1]])) for edge in list(set(network.edges))])
    parsed_nodes_to_start = parse_nodes_start(nodes_to_start)
    nodes_for_overview = heuristic_set_cover(
        adapted_ego_graphs, network_edges, nodes_to_account, parsed_nodes_to_start, max_nodes, min_edge_coverage
    )
    return nodes_for_overview

def create_distance_matrix(ego_graphs: dict) -> tuple:
    """
    Create a distance matrix from a dictionary of ego graphs using the Jaccard index.

    Args:
        ego_graphs (dict): A dictionary containing ego graphs for each node.

    Returns:
        tuple: A tuple containing the distance matrix and nodes.
    """
    return create_distance_matrix_from_dict(ego_graphs)

def save_data_network( network: Graph, metadata: pd.DataFrame, nodes_for_overview: list, distance_matrix: np.ndarray, nodes: list) -> None:
    """
    Save the data network to a temporary folder.

    Args:
        network (Graph): The input network.
        metadata (dict): A dictionary containing metadata derived from ego graphs.
        nodes_for_overview (list): A list of overview nodes.
        distance_matrix (np.ndarray): The distance matrix.
        nodes (list): A list of nodes.
    """

    # Create a temporary folder

    # Save the network to the temporary folder
    # Save the metadata to the temporary folder
    # Save the nodes for the overview to the temporary folder
    # Save the distance matrix to the temporary folder

def process_metadata(metadata: pd.DataFrame, all_nodes_network: set, classification_key: str = None, naming_key: str = "nodeID") -> tuple:
    """
    Process the metadata.

    Args:
        metadata (pd.DataFrame): The metadata to process.

    Returns:
        tuple: A tuple containing the processed metadata and classification dictionary.
    """
    table_data={}
    nodes_with_metadata = list(metadata.index)
    nodes_without_metadata = all_nodes_network - set(nodes_with_metadata)

    metadata["with_metadata"] = [True] * metadata.shape[0]
    metadata["found_in_network"] = [node in all_nodes_network for node in metadata.index]
    metadata["nodeID"] = metadata.index
    # add the nodes without metadata to the table
    for node in nodes_without_metadata:
        metadata.loc[node] = [False] * metadata.shape[1]
        metadata.loc[node, "with_metadata"] = False
        metadata.loc[node, "found_in_network"] = True
        metadata.loc[node, "nodeID"] = node
    # replace nan by ""
    metadata = metadata.fillna("")
    # set type of naming_key to string
    metadata[naming_key] = metadata[naming_key].astype(str)
    # Set nodeID as index
    metadata = metadata.set_index("nodeID")
    metadata["nodeID"] = metadata.index
    metadata["nodeID"] = metadata["nodeID"].astype(str)
    # Get Columns
    columns = list(metadata.columns)
    table_data["columns"] = [{"field": field, "headerName": field, "width": 150} for field in columns]
    data_as_dict = metadata.to_dict(orient="index")
    table_data["rows"] = { key: {name: is_number(value) for name, value in values.items()} for key, values in data_as_dict.items()}
    if classification_key is not None:
        classification_dict = {
            key: value[classification_key] for key, value in data_as_dict.items()
        }
    else:
        classification_dict = None

    return table_data, classification_dict

def process_distance_matrix(distance_matrix: np.ndarray, header:list, threshold_top_intersections: int = 25) -> dict:
    """
    Process the distance matrix.

    Args:
        distance_matrix (np.ndarray): The distance matrix.
        header (list): The header of the distance matrix.
        threshold_top_intersections (int): The threshold for the top intersections.

    Returns:
        dict: A dictionary containing the top intersections.
    """
    top_intersections_dict = {}
    for i in range(len(header)):
        indices_to_get = np.argsort(distance_matrix[i, :])[-threshold_top_intersections - 1 :]
        indices_to_get = np.delete(
            indices_to_get, np.where(indices_to_get == i)
        )  # remove the node itself
        top_intersections_dict[header[i]] = {
            header[index]: distance_matrix[i, index] for index in indices_to_get
        }
    return top_intersections_dict


def identify_separator(metadata_file: str) -> str:
    """
    Identify the separator used in the metadata file.

    Args:
        metadata_file (str): The path to the metadata file.

    Returns:
        str: The separator used in the metadata file.
    """
    with open(metadata_file, "r") as f:
        line = f.readline()
        if "\t" in line:
            separator = "\t"
        elif ";" in line:
            separator = ";"
        else:
            separator = ","
        
    return separator


def create_data_network(network_file: str, metadata_file: str, list_nodes_for_overview: str, max_nodes_overview: int, min_coverage_overview:float, classification_key:str=None) -> dict:
    """
    Create all necessary network files from the input files.

    Args:
        network_file (str): The path to the network file.
        metadata_file (str): The path to the metadata file.
        list_nodes_for_overview (str): The path to the list of nodes for the overview file.
        max_nodes_overview (int): The maximum number of nodes in the overview.
        min_coverage_overview (float): The minimum edge coverage for the overview.
        output_file (str): The path to the output file.
        separator (str): The separator used in the metadata file.

    Returns:
        dict: A dictionary containing the data network.
    """
    network = parse_network(network_file)
    ego_graphs, ego_graphs_as_dicts = create_ego_graphs(network)
    separator = ";"
    if metadata_file != None:
        separator = identify_separator(metadata_file)

    metadata = create_metadata(ego_graphs, metadata_file, separator)
    all_nodes = set(network.nodes)
    nodes_with_metadata = set(metadata.index)
    processed_metadata, classification_dict = process_metadata(metadata, all_nodes, classification_key)
    nodes_for_overview = create_set_overview_nodes(network, ego_graphs_as_dicts, nodes_with_metadata, list_nodes_for_overview, max_nodes_overview, min_coverage_overview)
    print(f"Nodes for overview: {nodes_for_overview}")
    distance_matrix, order_distance_matrix = create_distance_matrix(ego_graphs_as_dicts)
    top_intersections_dict = process_distance_matrix(distance_matrix, order_distance_matrix, threshold_top_intersections=25)
    start_radar_chart = nodes_for_overview[0]
    start_subnetwork = nodes_for_overview[0:5]
    # print(f"Network: {processed_metadata['rows']}, Metadata: {processed_metadata['columns']}, Overview: {nodes_for_overview}, Distance Matrix: {distance_matrix}, Nodes: {order_distance_matrix}")
    return {
        "network": network,
        "metadata": processed_metadata,
        "overview_nodes": nodes_for_overview,
        "top_intersections": top_intersections_dict,
        "classification": classification_dict,
        "start_radar": start_radar_chart,
        "start_selected": start_subnetwork

    }

import argparse
import json
def main():
    # Create argparser
    parser = argparse.ArgumentParser(
        description="Create data network from input files.")
    # Add arguments to the parser
    parser.add_argument(
        "-n",
        "--network",
        type=str,
        help="Path to the network file.",
        default="/Users/pacha/Documents/github_projects/Biovis-Challenge23/BiovisChallenge2023/server/data/example_PPIs/graphml_string_cleaned.graphml",
    )
    parser.add_argument(
        "-m",
        "--metadata",
        type=str,
        help="Path to the metadata file.",
        default="all_proteins_metadata.txt",
    )
   
    parser.add_argument(
        "-maxN",
        "--max_nodes",
        type=int,
        help="The maximum number of nodes in the overview.",
        default=100,
    )
    parser.add_argument(
        "-minE",
        "--min_coverage",
        type=float,
        help="The minimum edge coverage for the overview.",
        default=0.99,
    )
    parser.add_argument(
        "-out",
        "--output",
        type=str,
        help="Path to the output file.",
        default="data_network.json",
    )
    # Parse the arguments
    args = parser.parse_args()

    data_network = create_data_network(args.network, args.metadata, [], args.max_nodes, args.min_coverage)
    
    # Save the data network as json
    with open(args.output, "w") as f:
        json.dump(data_network, f)
    
if __name__ == "__main__":
    main()
