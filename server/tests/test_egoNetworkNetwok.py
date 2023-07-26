import unittest
import networkx as nx
import pytest
from server.python_scripts.egoGraph import EgoGraph
from server.python_scripts.egoNetworkNetwork import getEgoNetworkNetwork


@pytest.fixture(scope="module")
def ego_networks():
    """
    A fixture that returns a list of ego networks.
    """
    G = nx.Graph()
    # Add nodes with an ID and the attribute "name" besides for the ID 2
    G.add_nodes_from(
        [
            (1, {"name": "A", "classification": "A"}),
            (2),
            (3, {"name": "C", "classification": "C"}),
            (4, {"name": "D", "classification": "D"}),
            (5, {"name": "E", "classification": "E"}),
            (6, {"name": "F", "classification": "F"}),
            (7, {"name": "G", "classification": "G"}),
            (8, {"name": "H", "classification": "H"}),
            (9, {"name": "I", "classification": "I"}),
            (10, {"name": "J", "classification": "J"}),
            (11, {"name": "K"}),
            (12, {"name": "L"}),
        ]
    )
    G.add_edges_from(
        [
            (1, 2),
            (2, 3),
            (3, 4),
            (4, 5),
            (5, 6),
            (6, 1),
            (2, 7),
            (3, 8),
            (4, 9),
            (5, 10),
            (6, 11),
            (1, 12),
        ]
    )
    # generate 3 ego networks
    ego_networks = [EgoGraph.from_string_network(i, G) for i in [1, 2, 12]]
    yield ego_networks


class TestEgoNetworkNetwork:
    """
    Test the function getEgoNetworkNetwork.
    """

    # check if a networkX graph is returned
    def test_return_type(self, ego_networks):
        ego_network_network = getEgoNetworkNetwork(ego_networks)
        assert isinstance(ego_network_network, nx.Graph)

    # check if the number of nodes is correct
    def test_number_of_nodes(self, ego_networks):
        ego_network_network: nx.Graph = getEgoNetworkNetwork(ego_networks)
        assert ego_network_network.number_of_nodes() == 3

    # check if the number of edges is correct
    def test_number_of_edges(self, ego_networks):
        ego_network_network: nx.Graph = getEgoNetworkNetwork(ego_networks)
        assert ego_network_network.number_of_edges() == 3

    # check if the nodes have the correct attributes
    def test_node_attributes(self, ego_networks):
        ego_network_network: nx.Graph = getEgoNetworkNetwork(ego_networks)
        assert ego_network_network.nodes[1]["size"] == 8
        assert ego_network_network.nodes[2]["size"] == 8
        assert ego_network_network.nodes[12]["size"] == 4

    # check if the edges have the correct attributes
    def test_edge_attributes(self, ego_networks):
        ego_network_network: nx.Graph = getEgoNetworkNetwork(ego_networks)
        assert ego_network_network.edges[1, 2]["weight"] == 0.6
        assert ego_network_network.edges[1, 12]["weight"] == 0.5
        assert ego_network_network.edges[2, 12]["weight"] == 0.5
