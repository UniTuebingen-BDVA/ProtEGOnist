import networkx as nx
import json
from typing import cast, TypedDict

class Intersection(TypedDict):
  intersection: list[str|int]
  len1_prop: float
  len2_prop: float
  len3_prop: float
  len4_prop: float

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
    def __init__(self, node: str|int, graph: nx.Graph):
      """
      Constructor.
      
      Parameters:
        node: The node that is the center of the ego graph.
        graph: The networkx graph object of the ego graph.
      """
      self.node = node
      self.nxGraph: nx.Graph = nx.ego_graph(graph, node, radius=2)

    def getGraphJSON(self) -> str:
      """
      Returns the graph object as a serialized JSON representation.
      TODO: Currently this returns all attributes of nodes and edges. This might not be necessary.
      
      Returns:
        A JSON representation of the graph object.
      """
      node_link_data = dict(nx.node_link_data(self.nxGraph, {"link":"edges"}))
      #check if the nodes in node_link_data have an attribute "name" if not add the attribute "name" with the value of the attribute "id"
      for node in node_link_data["nodes"]:
        if "name" not in node:
          node["name"] = node["id"]
        node["originalID"] = node["id"]
        node["id"] = str(self.node) + '_' + str(node["id"])

      #change the edges such that they use the new node ids
      # for each edge in node_link_data["links"] add the attribute "id" as the string source + target

      for edge in node_link_data["edges"]:
        edge["source"] = str(self.node) + "_" + str(edge["source"])
        edge["target"] = str(self.node) + "_" + str(edge["target"])
        edge["id"] = str(edge["source"]) + "+" + str(edge["target"])


      # add a the center node as dictionary to the node_link_data
      node_link_data["center_node"] = {"id": str(self.node) + "_" + str(self.node), "originalID": self.node, "name": self.nxGraph.nodes[self.node]["name"] if self.nxGraph.nodes[self.node]["name"] else self.node }

      return json.dumps(node_link_data)
    
    
    def getNeighbors(self) -> dict[str, list[str|int]]:
      """
      Returns all degree-1 and degree2 neighbors of the node.
      
      Returns:
        A dictionary with two keys: "t1_neighbors" and "t2_neighbors".
        The values are lists of the neighbors of the node.
      """
      try:
        t1_neighbors: list[str|int] = list(self.nxGraph.neighbors(self.node))
        t2_neighbors: list[str|int] = list(nx.non_neighbors(self.nxGraph, self.node))
      except nx.NetworkXError:
        t1_neighbors = []
        t2_neighbors = []
        print("Node not in graph")
      return {"t1_neighbors": t1_neighbors, "t2_neighbors": t2_neighbors}
    
    def getIntersection(self, target: "egoGraph") -> Intersection:
      """
      Returns the intersection of the ego graph and the target ego graph.
      As both graphs are undirected, the intersection is symmetric.
      As two levels of neighbors are considered the intersections correspond to paths of different lengths.
      This means in cases where one of the ego-nodes is a direct neighbor of the other, the length of this element is 1.
      If direct neighbors of the ego-nodes are identical, the length of this element is 2.
      If a degree-2 neighbor of one ego-node is a direct neighbor of the other, the length of this element is 3.
      If a degree-2 neighbor of one ego-node is a degree-2 neighbor of the other, the length of this element is 4.
      This function reports the intersection set and the proportions of paths of different lengths.
      
      Parameters:
        target: The target ego graph.
      
      Returns:
        A dictionary containing the intersection set and the proportions of paths of different lengths.
      """
      self_neighbors = self.getNeighbors()
      target_neighbors = target.getNeighbors()
      print("ABC",target_neighbors)
      # union of t1 and t2 neighbors
      all_self = self_neighbors["t1_neighbors"] + self_neighbors["t2_neighbors"] + [self.node]
      all_target = target_neighbors["t1_neighbors"] + target_neighbors["t2_neighbors"] + [target.node]
      
      # all intersections
      intersection = list(set(all_self).intersection(set(all_target)))
      # Intersection elements of length 1
      len1_intersection_self_target = list(set([self.node]).intersection(set(target_neighbors["t1_neighbors"])))
      len1_intersection_target_self = list(set([target.node]).intersection(set(self_neighbors["t1_neighbors"])))
      # Intersection elements of length 2
      len2_intersection = list(set(self_neighbors["t1_neighbors"]).intersection(set(target_neighbors["t1_neighbors"])))
      len2_intersection_self_target = list(set([self.node]).intersection(set(target_neighbors["t2_neighbors"])))
      len2_intersection_target_self = list(set([target.node]).intersection(set(self_neighbors["t2_neighbors"])))
      # Intersection elements of length 3
      len3_intersection_self_target = list(set(self_neighbors["t1_neighbors"]).intersection(set(target_neighbors["t2_neighbors"])))
      len3_intersection_target_self = list(set(self_neighbors["t2_neighbors"]).intersection(set(target_neighbors["t1_neighbors"])))
      # Intersection elements of length 4
      len4_intersection = list(set(self_neighbors["t2_neighbors"]).intersection(set(target_neighbors["t2_neighbors"])))

      # Proportions of paths of different lengths
      len1_prop = len(len1_intersection_self_target) + len(len1_intersection_target_self)
      len2_prop = len(len2_intersection) + len(len2_intersection_self_target) + len(len2_intersection_target_self)
      len3_prop = len(len3_intersection_self_target) + len(len3_intersection_target_self)
      len4_prop = len(len4_intersection)
      total_prop = len1_prop + len2_prop + len3_prop + len4_prop
      print(total_prop == len(intersection))
      len1_prop = len1_prop / total_prop
      len2_prop = len2_prop / total_prop
      len3_prop = len3_prop / total_prop
      len4_prop = len4_prop / total_prop

      out_dict: Intersection = {"intersection": intersection, "len1_prop": len1_prop, "len2_prop": len2_prop, "len3_prop": len3_prop, "len4_prop": len4_prop}
      return out_dict
