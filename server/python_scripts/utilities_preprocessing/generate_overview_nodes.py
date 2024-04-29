import array
import numpy as np
import time
import copy
import argparse
from networkx import read_weighted_edgelist, read_graphml, Graph


def parse_ego_dict(path: str) -> dict:
    """
    Parse the ego dict from the given path.
    """
    ego_dict = np.load(path, allow_pickle=True).item()
    ego_dict = {node: ego_dict[node]["edges"]
                for node in ego_dict.keys()}
    return ego_dict


def heuristic_set_cover(dict: dict, network_edges: set, account: array = None, start_set: array = None, max_nodes:int=100, min_edge_coverage:float=0.99):
    """
    Return the set of subsets that covers the most edges.
    """
    # deepcopy the dictionary
    dict_copy = copy.deepcopy(dict)
    start_time = time.time()
    print(start_set)
    print("Start set cover")
    print(start_time)
    all_edges = set()
    for node in dict_copy.keys():
        all_edges.update(dict_copy[node])
    print("You can achieve at most a coverage of",
          len(all_edges)/len(network_edges))
    print(len(account))
    keys_to_account = dict_copy.keys() if account == None else account
    keys_to_account = [
        node for node in keys_to_account if node in dict_copy.keys()]
    print(len(keys_to_account))
    found_edges = set()
    keys_to_choose = []
    # If the user provides a start set, we start with this set
    if start_set == None:
        start_set = []
    if len(start_set) > 0 and start_set:
        start_set = set(start_set)
        # check that the start set is in the keys to account
        start_set = set([node for node in start_set if node in keys_to_account])
        keys_to_choose = list(start_set)
        # remove the start set from the keys to account
        keys_to_account = [node for node in keys_to_account if node not in start_set]
        # remove the start set from the dict
        for node in start_set:
            found_edges.update(dict_copy[node])
            del dict_copy[node]
        # remove the found edges from the other keys
        to_delete = []
        for key in dict_copy.keys():
            dict_copy[key] = dict_copy[key].difference(found_edges)
            if len(dict_copy[key]) == 0:
                to_delete.append(key)
        # If any key has no edges left, remove it from the dict, but only if it is not in the start set
        for key in to_delete:
            if key in start_set:
                continue
            elif key in keys_to_account:
                keys_to_account.remove(key)
            del dict_copy[key]
    print("Elapsed time all edges creation", time.time() - start_time)
    i = 0
    whole_network_edges = network_edges
    while len(found_edges)/len(whole_network_edges) < min_edge_coverage and len(keys_to_choose) < max_nodes and len(keys_to_account) > 0:
        keys_by_length = sorted(
            keys_to_account, key=lambda x: len(dict_copy[x]) if x in dict_copy.keys() else 0)
        best_key = keys_by_length.pop()
        # remove the best key from the dict
        keys_to_choose.append(best_key)
        found_edges.update(dict_copy[best_key])
        del dict_copy[best_key]
        # remove the found edges from the other keys
        to_delete = []
        for key in dict_copy.keys():
            dict_copy[key] = dict_copy[key].difference(found_edges)
            if len(dict_copy[key]) == 0:
                to_delete.append(key)
        for key in to_delete:
            if key in start_set:
                continue
            elif key in keys_to_account:
                keys_to_account.remove(key)
            del dict_copy[key]
        print("Elapsed time on round", time.time() - start_time, "round", i)
        print("covered edges on round", len(found_edges)/len(all_edges))
        i += 1
    print("Elapsed time final", time.time() - start_time)
    print("covered edges final", len(found_edges)/len(all_edges))
    print("number of keys", len(keys_to_choose)
          )
    print("number of edges", len(found_edges))
    print("number of all edges", len(all_edges))
    return keys_to_choose


def parse_nodes_to_account(path) -> array:
    """
    Parse the nodes to account from the given path.
    """
    with open(path, "r") as f:
        nodes_to_account = [line.strip() for line in f]
    return nodes_to_account


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


def main():
    # create parser
    parser = argparse.ArgumentParser(
        "Create set of overviews nodes for the network.")
    parser.add_argument(
        "-i",
        "--input",
        type=str,
        help="Path to the ego dict.",
        default="ego_dict_as_pickle.npy",
    )
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
        "-o",
        "--output",
        type=str,
        help="Path to the output distance matrix.",
        default="important_nodes.txt.gz",
    )
    # parse the arguments
    args = parser.parse_args()

    # Parse File with ego graphs
    ego_dict = parse_ego_dict(args.input)
    # Parse File with network
    if args.network.endswith(".tsv"):
        network = read_tsv_to_network(args.network)
    elif args.network.endswith(".graphml"):
        network = read_graphml_to_network(args.network)
    print(len(network.edges))
    network_edges = set([tuple(sorted(edge))
                        for edge in list(set(network.edges))])
    print(len(network_edges))
    # Parse File with nodes to account
    keys_to_account = parse_nodes_to_account(args.metadata)
    subset_opt = heuristic_set_cover(ego_dict, network_edges, keys_to_account)
    # Write subset to a txt file
    with open(args.output, "w") as f:
        for s in subset_opt:
            f.write(str(s) + "\n")


if __name__ == "__main__":
    main()