import unittest
import networkx as nx
import pytest
from server.python_scripts.egoGraph import egoGraph

@pytest.fixture(scope="module")
def G():
    """
    A fixture that returns a networkx graph.
    """
    G = nx.Graph()
    # Add nodes with an ID and the attribute "name" besides for the ID 2
    G.add_nodes_from([(1, {"name": "A"}), (2), (3, {"name": "C"}), (4, {"name": "D"}), (5, {"name": "E"}), (6, {"name": "F"}), (7, {"name": "G"}), (8, {"name": "H"}), (9, {"name": "I"}), (10, {"name": "J"}), (11, {"name": "K"}), (12, {"name": "L"})])
    G.add_edges_from([(1, 2), (2, 3), (3, 4), (4, 5), (5, 6), (6, 1), (2, 7), (3, 8), (4, 9), (5, 10), (6, 11), (1, 12)])
    yield G

class TestConstructor:
    """
    Test the constructor of the egoGraph class.
    """
    def test_constructor(self, G: nx.Graph):
        # print type of G
        print(type(G))

        # Create an ego graph from the networkx graph
        ego = egoGraph(1, G)

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
        ego = egoGraph(1, G)

        # Compute the neighbors
        result = ego.getNeighbors()

        # Check the neighbors
        assert result["t1_neighbors"] == [2, 6, 12]
        assert result["t2_neighbors"] == [3,5,7,11]


class TestGetIntersction:
    def test_getIntersection(self, G: nx.Graph):
        # Create two ego graphs from the networkx graph
        ego1 = egoGraph(1, G)
        ego2 = egoGraph(2, G)

        # Compute the intersection
        result = ego1.getIntersection(ego2)

        # Check the intersection set
        assert set(result["intersection"]) == {1,2,3,6,7,12}

        # Check the proportions of paths of different lengths
        assert pytest.approx(result["len1_prop"], 0.01) == 0.333
        assert pytest.approx(result["len2_prop"], 0.01) == 0.0
        assert pytest.approx(result["len3_prop"], 0.01) == 0.666
        assert pytest.approx(result["len4_prop"], 0.01) == 0.0

class TestGetGraphJSON:
    def test_getGraphJSON(self, G):
        # Create an ego graph from the networkx graph
        ego = egoGraph(1, G)

        # Compute the graph JSON
        result = ego.getGraphJSON()
        print(result)
        # Check the graph JSON
        assert result == "{\"directed\": false, \"multigraph\": false, \"graph\": {}, \"nodes\": [{\"name\": \"A\", \"id\": \"1_1\", \"originalID\": 1}, {\"id\": \"1_2\", \"name\": 2, \"originalID\": 2}, {\"name\": \"C\", \"id\": \"1_3\", \"originalID\": 3}, {\"name\": \"E\", \"id\": \"1_5\", \"originalID\": 5}, {\"name\": \"F\", \"id\": \"1_6\", \"originalID\": 6}, {\"name\": \"G\", \"id\": \"1_7\", \"originalID\": 7}, {\"name\": \"K\", \"id\": \"1_11\", \"originalID\": 11}, {\"name\": \"L\", \"id\": \"1_12\", \"originalID\": 12}], \"edges\": [{\"source\": \"1_1\", \"target\": \"1_2\", \"id\": \"1_1+1_2\"}, {\"source\": \"1_1\", \"target\": \"1_6\", \"id\": \"1_1+1_6\"}, {\"source\": \"1_1\", \"target\": \"1_12\", \"id\": \"1_1+1_12\"}, {\"source\": \"1_2\", \"target\": \"1_3\", \"id\": \"1_2+1_3\"}, {\"source\": \"1_2\", \"target\": \"1_7\", \"id\": \"1_2+1_7\"}, {\"source\": \"1_5\", \"target\": \"1_6\", \"id\": \"1_5+1_6\"}, {\"source\": \"1_6\", \"target\": \"1_11\", \"id\": \"1_6+1_11\"}], \"center_node\": {\"id\": \"1_1\", \"originalID\": 1, \"name\": \"A\"}}"

if __name__ == '__main__':
    unittest.main()