from networkx import read_weighted_edgelist, read_graphml, Graph
from server.python_scripts.egoGraph import EgoGraph
import numpy as np
import pandas as pd
import argparse


def read_tsv_to_network(path: str) -> Graph:
    """
    Read a tsv file into a networkX element.
    """
    return read_weighted_edgelist(path, delimiter="\t")


def read_graphml_to_network(path: str) -> Graph:
    """
    Read a graphml file into a networkX element.
    """
    return read_graphml(path)


def create_ego_graph(ego_graph: EgoGraph, node: str) -> dict:
    """
    Create an ego graph from a networkX element.
    """
    ego_dict = {
        "node": node,
        "nodes": ego_graph.get_node_set(),
        "edges": ego_graph.get_edge_set(),
    }
    return ego_dict


def create_ego_graphs_dicts_for_network(dict_of_ego_graphs: dict) -> dict:
    """
    Create an ego graph for each node in a networkX element.
    """
    ego_graphs = {}
    for egoGraphKey in dict_of_ego_graphs:
        ego_graph = dict_of_ego_graphs[egoGraphKey]
        ego_graphs[egoGraphKey] = create_ego_graph(ego_graph, egoGraphKey)
    return ego_graphs


def create_ego_graphs_for_network(network: Graph) -> dict:
    """
    Create an ego graph for each node in a networkX element.
    """
    ego_graphs = {}
    for node in network.nodes:
        ego_graphs[node] = EgoGraph.from_string_network(node, network)
    return ego_graphs


def ego_graphs_to_metadata(ego_graphs: dict, metadata: pd.DataFrame) -> pd.DataFrame:
    """
    add metadata dervied from ego graphs to a metadata dat
    metadata to be added includes:
    - number of nodes
    - number of edges
    - average degree
    - level 1 neighbours
    - level 2 neighbours
    """

    for node in ego_graphs:
        ego_graph = ego_graphs[node]
        ego_graph_neighbors = ego_graph.get_neighbors()
        degree_1_alters = ego_graph_neighbors["t1_neighbors"]
        degree_2_alters = ego_graph_neighbors["t2_neighbors"]
        all_nodes = degree_1_alters + degree_2_alters + [node]
        all_edges = ego_graph.get_edge_set()
        # current row index in metadata
        metadata.loc[node, "number_of_nodes"] = len(all_nodes)
        metadata.loc[node, "number_of_edges"] = len(all_edges)
        metadata.loc[node, "average_degree"] = len(all_edges) / len(all_nodes)
        metadata.loc[node, "degree_1_alters"] = len(degree_1_alters)
        metadata.loc[node, "degree_2_alters"] = len(degree_2_alters)
    return metadata


def main():
    # create parser
    parser = argparse.ArgumentParser(description="Create ego graphs from a network.")
    # add arguments to the parser
    parser.add_argument(
        "-i",
        "--input",
        type=str,
        help="Path to the network file.",
        default="/Users/pacha/Documents/github_projects/Biovis-Challenge23/BiovisChallenge2023/server/data/example_PPIs/graphml_string_cleaned.graphml",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=str,
        help="Path to the output pickle file.",
        default="ego_dict_as_pickle.npy",
    )
    parser.add_argument(
        "-m",
        "--metadata",
        type=str,
        help="Path to the metadata file.",
        default="metadata.csv",
    )
    parser.add_argument(
        "-mo",
        "--metadata_output",
        type=str,
        help="Path to the output metadata file.",
        default="metadata_new.csv",
    )
    parser.add_argument(
        "-s",
        "--separator",
        type=str,
        help="Separator for the metadata file.",
        default=";",
    )
    # parse the arguments
    args = parser.parse_args()
    # read the network
    if args.input.endswith(".tsv"):
        network = read_tsv_to_network(args.input)
    elif args.input.endswith(".graphml"):
        network = read_graphml_to_network(args.input)
    # create the ego graphs
    ego_graphs = create_ego_graphs_for_network(network)
    # save the ego graphs as pickle file
    ego_graphs_dict = create_ego_graphs_dicts_for_network(ego_graphs)
    np.save(args.output, ego_graphs_dict)
    # read the metadata
    metadata = pd.read_csv(
        args.metadata,
        index_col=0,
        sep=args.separator,
        encoding="utf-8",
    )
    # add metadata to the metadata dataframe
    metadata = ego_graphs_to_metadata(ego_graphs, metadata)
    # save the metadata
    metadata.to_csv(
        args.metadata_output,
        sep=args.separator,
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
