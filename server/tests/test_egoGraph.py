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
        assert result == "{\"directed\": false, \"multigraph\": false, \"graph\": {}, \"nodes\": [{\"id\": 1}, {\"id\": 2}, {\"id\": 3}, {\"id\": 5}, {\"id\": 6}, {\"id\": 7}, {\"id\": 11}, {\"id\": 12}], \"edges\": [{\"from\": 1, \"to\": 2}, {\"from\": 1, \"to\": 6}, {\"from\": 1, \"to\": 12}, {\"from\": 2, \"to\": 3}, {\"from\": 2, \"to\": 7}, {\"from\": 5, \"to\": 6}, {\"from\": 6, \"to\": 11}]}"

if __name__ == '__main__':
    unittest.main()