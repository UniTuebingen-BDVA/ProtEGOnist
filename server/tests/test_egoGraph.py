import unittest
import networkx as nx
import pytest
from server.python_scripts.egoGraph import EgoGraph


@pytest.fixture(scope="module")
def G():
    """
    A fixture that returns a networkx graph.
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
    yield G


class TestConstructor:
    """
    Test the constructor of the egoGraph class.
    """

    def test_constructor(self, G: nx.Graph):
        # print type of G
        print(type(G))

        # Create an ego graph from the networkx graph
        ego = EgoGraph.from_string_network(1, G)

        # Check the node attribute
        assert ego.node == 1
        #
        print(type(ego.nxGraph))
        # Check the graph attribute
        assert isinstance(ego.nxGraph, nx.Graph)


class TestGetNeighbors:
    """
    Test the getNeighbors method of the egoGraph class.
    """

    def test_getNeighbors(self, G: nx.Graph):
        # Create an ego graph from the networkx graph
        ego = EgoGraph.from_string_network(1, G)

        # Compute the neighbors
        result = ego.get_neighbors()

        # Check the neighbors
        assert result["t1_neighbors"] == [2, 6, 12]
        assert result["t2_neighbors"] == [3, 5, 7, 11]


class TestGetIntersction:
    def test_getIntersection(self, G: nx.Graph):
        # Create two ego graphs from the networkx graph
        ego1 = EgoGraph.from_string_network(1, G)
        ego2 = EgoGraph.from_string_network(2, G)

        # Compute the intersection
        result = ego1.get_intersection(ego2)

        # Check the intersection set
        assert set(result["intersection"]) == {1, 2, 3, 6, 7, 12}

        # Check the proportions of paths of different lengths
        assert pytest.approx(result["jaccard"], 0.01) == 0.6
        assert result["classification"] == "A"
        assert pytest.approx(result["len1Proportion"], 0.01) == 0.333
        assert pytest.approx(result["len2Proportion"], 0.01) == 0.0
        assert pytest.approx(result["len3Proportion"], 0.01) == 0.666
        assert pytest.approx(result["len4Proportion"], 0.01) == 0.0


class TestGetGraphJSON:
    def test_getGraphJSON(self, G):
        # Create an ego graph from the networkx graph
        ego = EgoGraph.from_string_network(1, G)

        # Compute the graph JSON
        result = ego.get_graph_JSON()
        print(result)
        # Check the graph JSON
        assert (
            result
            == '{"directed": false, "multigraph": false, "graph": {}, "nodes": [{"name": "A", "classification": "A", "id": "1_1", "centerDist": 0, "originalID": 1}, {"id": "1_2", "name": 2, "classification": "default", "centerDist": 1, "originalID": 2}, {"name": "C", "classification": "C", "id": "1_3", "centerDist": 2, "originalID": 3}, {"name": "E", "classification": "E", "id": "1_5", "centerDist": 2, "originalID": 5}, {"name": "F", "classification": "F", "id": "1_6", "centerDist": 1, "originalID": 6}, {"name": "G", "classification": "G", "id": "1_7", "centerDist": 2, "originalID": 7}, {"name": "K", "id": "1_11", "classification": "default", "centerDist": 2, "originalID": 11}, {"name": "L", "id": "1_12", "classification": "default", "centerDist": 1, "originalID": 12}], "edges": [{"source": "1_1", "target": "1_2", "id": "1_1+1_2"}, {"source": "1_1", "target": "1_6", "id": "1_1+1_6"}, {"source": "1_1", "target": "1_12", "id": "1_1+1_12"}, {"source": "1_2", "target": "1_3", "id": "1_2+1_3"}, {"source": "1_2", "target": "1_7", "id": "1_2+1_7"}, {"source": "1_5", "target": "1_6", "id": "1_5+1_6"}, {"source": "1_6", "target": "1_11", "id": "1_6+1_11"}], "centerNode": {"id": "1_1", "originalID": 1, "name": "A"}}'
        )


class TestGetNodeAttibutes:
    def test_getNodeAttributes(self, G):
        # Create an ego graph from the networkx graph
        ego = EgoGraph.from_string_network(1, G)

        # Compute the node attributes
        result = ego.get_node_attributes(1)

        # Check the node attributes
        assert result == {
            "name": "A",
            "classification": "A",
            "id": 1,
            "centerDist": 0,
        }

    def test_getNodeAttributes2(self, G):
        # Create an ego graph from the networkx graph
        ego = EgoGraph.from_string_network(1, G)

        # Compute the node attributes
        result = ego.get_node_attributes(2)

        # Check the node attributes
        assert result == {
            "name": 2,
            "classification": "default",
            "id": 2,
            "centerDist": 1,
        }


if __name__ == "__main__":
    unittest.main()
