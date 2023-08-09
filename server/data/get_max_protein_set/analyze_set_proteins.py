
import networkx as nx
import json
from python_scripts.egoGraph import EgoGraph
import argparse
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import seaborn as sns


def read_graph(path):
    string_graph = nx.read_graphml(path)
    return string_graph


def get_ego_graph_proteins(string_graph: nx.Graph, targetNode: str) -> list:
    """Get the EGO-graph of a given protein
    """
    # get the ego graph of the target node

    ego_graph_networks = EgoGraph.from_string_network(
        targetNode, string_graph).get_neighbors()
    # join the lists of neighbors
    protein_set = [
        targetNode] + ego_graph_networks["t1_neighbors"] + ego_graph_networks["t2_neighbors"]
    # protein_set = set(targetNode), set() ego_graph_networks["t1_neighbors"], ego_graph_networks["t2_neighbors"]])
    return protein_set


def read_protein_set(path):
    # read json file
    with open(path, "r") as f:
        protein_set = json.load(f)
    return protein_set


def get_coverage_of_starting_set(protein_set, string_graph, all_prots_graph, all_prots_edges):
    """Get the coverage of the starting set of proteins for the given PPI network

    Args:
        protein_set (set): Set of all proteins from the starting set
        string_graph (NetworkX): NetworkX graph object containing the PPI network from string
        all_prots_graph (set): Set of all proteins from the PPI network
        all_prots_edges (set): Edges from the PPI network
    """
    subset_proteins_fitl = set()
    ego_centers = set()
    with open('all_proteins.txt', 'w') as f:
        for protein, data in protein_set.items():
            if data['uniprot-id'] == 'not found':
                continue
            ego_centers.add(data['uniprot-id'])
            subset_proteins_fitl.add(data['uniprot-id'])
            protein_set = get_ego_graph_proteins(
                string_graph, data['uniprot-id'])
            f.write(f'{data["uniprot-id"]}\t{len(protein_set)}\n')
            subset_proteins_fitl = subset_proteins_fitl.union(protein_set)
    print(
        f'The set of filtered proteins has a size of {len(ego_centers)} ego centers')
    print(
        f'By using the set of filtered proteins as anchors we get a total of {len(subset_proteins_fitl)} proteins, which is {100*len(subset_proteins_fitl)/len(all_prots_graph)}% of the original graph')
    subgraph_start = string_graph.subgraph(subset_proteins_fitl)
    edges = subgraph_start.edges()
    print(
        f'By using the set of filtered proteins as anchors we get a total of {len(edges)} edges, which is {100*len(edges)/len(all_prots_edges)}% of the original graph')

    # get difference between subset and all proteins in graph
    not_accounted_prots = all_prots_graph.difference(subset_proteins_fitl)
    ego_networks_not_accounted = {}
    for prot in not_accounted_prots:
        ego_network = get_ego_graph_proteins(string_graph, prot)
        ego_networks_not_accounted[ego_network[0]] = ego_network

    # sort the list of keys by length of the ego network
    ego_centers_not_accounted = list(ego_networks_not_accounted.keys())
    ego_centers_not_accounted.sort(
        key=lambda x: len(ego_networks_not_accounted[x]), reverse=True)
    for_plotting_coverage = [
        (len(ego_centers), len(subset_proteins_fitl), len(edges), len(subset_proteins_fitl) / len(all_prots_graph), len(edges) / len(all_prots_edges))]

    expanding_ego_centers = ego_centers.copy()
    expanding_subset_proteins_fitl = subset_proteins_fitl.copy()

    # Increase the protein set by adding the ego networks of the proteins that are not in the starting set

    for ego_center in ego_centers_not_accounted:
        ego_network = ego_networks_not_accounted[ego_center]
        expanding_ego_centers.add(ego_center)
        expanding_subset_proteins_fitl = expanding_subset_proteins_fitl.union(
            ego_network)
        subgraph = string_graph.subgraph(expanding_subset_proteins_fitl)
        edges = subgraph.edges()
        for_plotting_coverage.append(
            (len(expanding_ego_centers), len(expanding_subset_proteins_fitl), len(edges), len(expanding_subset_proteins_fitl) / len(all_prots_graph), len(edges) / len(all_prots_edges), ego_center))

        # Remove all elements from the list of ego centers that are already in another list
        ego_centers_not_accounted = list(
            set(ego_centers_not_accounted).difference(set(ego_network)))
        ego_centers_not_accounted.sort(
            key=lambda x: len(ego_networks_not_accounted[x]), reverse=True)
        if len(expanding_subset_proteins_fitl) == len(all_prots_graph):
            break
        if len(edges) / len(all_prots_edges) > 0.99:
            break

    # save the results to a file as pandas dataframe
    df = pd.DataFrame(for_plotting_coverage, columns=[
        'Number of EGO centers', 'Number of proteins', 'Number of edges', 'Coverage of proteins', 'Coverage of edges', 'added EGO center'])

    # save as pickle file
    df.to_pickle('coverage.pkl')


def get_random_set(string_graph, method='repetition', size=91, min_neighbors=3):
    """Get a random set of proteins from the PPI network

    Args:
        string_graph (NetworkX): NetworkX graph object containing the PPI network from string
        method (str, optional): Method to get the random set. Defaults to 'repetition'.
        size (int, optional): Size of the random set. Defaults to 91.

    Raises:
        ValueError: If the method is not valid

    Returns:
        set: Set of random proteins
        set: Set of all neighbors of the random proteins
    """
    all_neighbors = set()
    random_proteins = set()
    if method == 'repetition':
        all_prots_graph = set(string_graph.nodes)
        random_proteins = set(np.random.choice(
            list(all_prots_graph), size=size, replace=False))
        for protein in random_proteins:
            neighoring_proteins = get_ego_graph_proteins(string_graph, protein)
            all_neighbors = all_neighbors.union(neighoring_proteins)

    elif method == 'without_overlap':
        all_prots_graph_without_overlap = set(string_graph.nodes)
        while len(random_proteins) < size or len(all_prots_graph_without_overlap) == 0:
            all_prots_graph_without_overlap = all_prots_graph_without_overlap.difference(
                all_neighbors)

            random_protein = np.random.choice(
                list(all_prots_graph_without_overlap), size=1, replace=False)[0]
            neighboring_proteins = get_ego_graph_proteins(
                string_graph, random_protein)
            while len(neighboring_proteins) < min_neighbors:
                all_prots_graph_without_overlap = all_prots_graph_without_overlap.difference(
                    random_protein)
                random_protein = np.random.choice(
                    list(all_prots_graph_without_overlap), size=1, replace=False)[0]
                neighboring_proteins = get_ego_graph_proteins(
                    string_graph, random_protein)
            all_neighbors = all_neighbors.union(neighboring_proteins)
            random_proteins.add(random_protein)

    else:
        raise ValueError('The method is not valid')

    return random_proteins, all_neighbors


def get_coverage_random_sets(string_graph, all_prots_graph, all_prots_edges):
    # type: (nx.Graph, set, set) -> list
    """Get the coverage of a set of proteins for the given PPI network

     Args:
        protein_set (set): Set of all proteins from the starting set
        string_graph (NetworkX): NetworkX graph object containing the PPI network from string
        all_prots_graph (set): Set of all proteins from the PPI network
        all_prots_edges (set): Edges from the PPI network
    """
    print('Getting random sets')

    # simple_sampling_method(string_graph, all_prots_graph, all_prots_edges)
    # sampling_with_removal(string_graph, all_prots_graph, all_prots_edges)
    # sampling_with_filter(string_graph, all_prots_graph, all_prots_edges)
    # sampling_with_filter(string_graph, all_prots_graph, all_prots_edges, 10)
    # sampling_with_filter(string_graph, all_prots_graph, all_prots_edges, 20)
    simple_sampling_method_with_filter(
        string_graph, all_prots_graph, all_prots_edges, 20)


def sampling_with_filter(string_graph, all_prots_graph, all_prots_edges, min_neighbors=3):
    print('Getting random sets with filtering')
    data_plotting = []
    for i in range(100):
        if i % 10 == 0:
            print(f'Iteration {i}')
        random_set, all_neighbors = get_random_set(
            string_graph, method='without_overlap', min_neighbors=min_neighbors)
        edges_covered = string_graph.subgraph(all_neighbors).edges()
        data_plotting.append((i, len(random_set), len(all_neighbors),
                              len(edges_covered),  len(all_neighbors) / len(all_prots_graph), len(edges_covered) / len(all_prots_edges)))
    df = pd.DataFrame(data_plotting, columns=['Iteration', 'Number of EGO centers', 'Number of proteins',
                                              'Number of edges', 'Coverage of proteins', 'Coverage of edges'])
    df.to_pickle(f'random_set_with_filter{min_neighbors}.pkl')


def sampling_with_removal(string_graph, all_prots_graph, all_prots_edges):
    print('Getting random sets without neighbors repetition')
    data_plotting = []
    for i in range(100):
        if i % 10 == 0:
            print(f'Iteration {i}')
        random_set, all_neighbors = get_random_set(
            string_graph, method='without_overlap')
        edges_covered = string_graph.subgraph(all_neighbors).edges()
        data_plotting.append((i, len(random_set), len(all_neighbors),
                              len(edges_covered),  len(all_neighbors) / len(all_prots_graph), len(edges_covered) / len(all_prots_edges)))
    df = pd.DataFrame(data_plotting, columns=['Iteration', 'Number of EGO centers', 'Number of proteins',
                                              'Number of edges', 'Coverage of proteins', 'Coverage of edges'])
    df.to_pickle('random_set_without_rep.pkl')


def simple_sampling_method(string_graph, all_prots_graph, all_prots_edges):
    data_plotting = []
    print('Getting random sets with repetition')
    for i in range(100):
        if i % 10 == 0:
            print(f'Iteration {i}')
        random_set, all_neighbors = get_random_set(string_graph)
        edges_covered = string_graph.subgraph(all_neighbors).edges()
        data_plotting.append((i, len(random_set), len(all_neighbors),
                              len(edges_covered),  len(all_neighbors) / len(all_prots_graph), len(edges_covered) / len(all_prots_edges)))
    df = pd.DataFrame(data_plotting, columns=['Iteration', 'Number of EGO centers', 'Number of proteins',
                      'Number of edges', 'Coverage of proteins', 'Coverage of edges'])
    df.to_pickle('random_set_with_rep.pkl')


def simple_sampling_method_with_filter(string_graph, all_prots_graph, all_prots_edges, min_neighbors=3):
    data_plotting = []
    print('Getting random sets with repetition')
    for i in range(100):
        if i % 10 == 0:
            print(f'Iteration {i}')
        random_set, all_neighbors = get_random_set(
            string_graph, min_neighbors=min_neighbors)
        edges_covered = string_graph.subgraph(all_neighbors).edges()
        data_plotting.append((i, len(random_set), len(all_neighbors),
                              len(edges_covered),  len(all_neighbors) / len(all_prots_graph), len(edges_covered) / len(all_prots_edges)))
    df = pd.DataFrame(data_plotting, columns=['Iteration', 'Number of EGO centers', 'Number of proteins',
                      'Number of edges', 'Coverage of proteins', 'Coverage of edges'])
    df.to_pickle(f'simple_random_set_with_filter{min_neighbors}.pkl')


def main():
    # Set arguments
    parser = argparse.ArgumentParser(
        description='Extract all EGO-graph neighbors from a given set of proteins')
    parser.add_argument('-p', "--proteins", type=str,
                        help='The name of the json file containing the protein set', required=False)
    parser.add_argument('-g', "--graph", type=str,
                        help='The name of the graphml file')

    # Get arguments
    args = parser.parse_args()
    string_graph = read_graph(args.graph)
    all_prots_graph = set(string_graph.nodes)
    all_prots_edges = set(string_graph.edges)
    print(f'The graph contains {len(all_prots_graph)} proteins')
    print(f'The graph contains {len(all_prots_edges)} edges')

    if args.proteins:
        protein_set = read_protein_set(args.proteins)
        get_coverage_of_starting_set(
            protein_set, string_graph, all_prots_graph, all_prots_edges)
    else:
        get_coverage_random_sets(
            string_graph, all_prots_graph, all_prots_edges)


if __name__ == "__main__":
    main()
