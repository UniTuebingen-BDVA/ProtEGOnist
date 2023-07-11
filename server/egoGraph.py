import networkx as nx
import json
from typing import Tuple

class egoGraph():
    """
    A class representing the ego graph of a given node.
    
    Attributes:
        node: The node that is the center of the ego graph.
        graph: The networkx ego-graph object of the ego graph.
    
    Methods:
        __init__(self, node, graph): Constructor.
        getGraphJSON(self): Returns the graph object as a JSON representation.
        getNodes(self): Returns all nodes in the graph.
        getEdges(self): Returns all edges in the graph.
        getNeighbors(self): Returns all degree-1 and degree2 neighbors of the node.
        getIntersection(self, target): Returns the intersection of the ego graph and the target ego graph.
    """
    def __init__(self, node: str, graph: nx.Graph):
      """
      Constructor.
      
      Parameters:
        node: The node that is the center of the ego graph.
        graph: The networkx graph object of the ego graph.
      """
      self.node = node
      self.nxGraph: nx.Graph = graph

    def getGraphJSON(self) -> str:
      """
      Returns the graph object as a serialized JSON representation.
      TODO: Currently this returns all attributes of nodes and edges. This might not be necessary.
      
      Returns:
        A JSON representation of the graph object.
      """
      return json.dumps(nx.node_link_data(self.graph, link="edges", source="from", target="to"))
    
    
    def getNeighbors(self):
      """
      Returns all degree-1 and degree2 neighbors of the node.
      
      Returns:
        A list of all degree-1 and degree2 neighbors of the node.
      """
      t1_neighbors = list(self.nxGraph.neighbors(self.node))
      t2_neighbors = list(nx.non_neighbors(self.nxGraph, self.node))
      return {"t1_neighbors": t1_neighbors, "t2_neighbors": t2_neighbors}
    
    def getIntersection(self, target: "egoGraph") -> Tuple[list, list]:
      """
      Returns the intersection of the ego graph and the target ego graph.
      consideres both t1 and t2 neighbors, such that direct connections of ego-node and t1, t1 and t1, t1 and t2 and t2 and t2 are considered.
      
      Parameters:
        target: The target ego graph.
      
      Returns:
        A tuple of lists containing the nodes and edges that are in both ego graphs.
      """

      