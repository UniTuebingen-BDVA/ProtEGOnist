

from networkx import read_weighted_edgelist, read_graphml, Graph
from egoGraph import EgoGraph
import numpy as np
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


def create_ego_graph(network: Graph, node: str) -> dict:
    """
    Create an ego graph from a networkX element.
    """
    ego_graph = EgoGraph.from_string_network(node, network)
    ego_dict = {
        "node": node,
        "nodes": ego_graph.get_node_set(),
        "edges": ego_graph.get_edge_set(),
    }
    return ego_dict


def create_ego_graphs_for_network(network: Graph) -> dict:
    """
    Create an ego graph for each node in a networkX element.
    """
    ego_graphs = {}
    for node in network.nodes:
        ego_graphs[node] = create_ego_graph(network, node)
    return ego_graphs


def main():
    # create parser
    parser = argparse.ArgumentParser(
        description="Create ego graphs from a network.")
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
    # parse the arguments
    args = parser.parse_args()
    # read the network
    network = read_graphml_to_network(args.input)
    print(len(network.nodes))
    # create the ego graphs
    ego_graphs = create_ego_graphs_for_network(network)
    print(len(ego_graphs.keys()))
    # save the ego graphs as pickle file
    np.save(args.output, ego_graphs)


if __name__ == "__main__":
    main()
