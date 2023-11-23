# here functions generating a network of ego networks are defined

# import egoNetwork
import networkx as nx
from server.python_scripts.egoGraph import EgoGraph


class EgoNetworkNetwork:
    """
    A class representing a network of ego networks.
    """

    def __init__(self, ego_networks: list[EgoGraph]):
        """
        Parameters
        ----------
        ego_networks : list[EgoGraph]
            A list of ego networks.
        """
        self.ego_networks = ego_networks
        self.nx_graph = self.get_ego_network_network(ego_networks)

    def get_graph_json(self):
        node_link_data = dict(nx.node_link_data(self.nx_graph, {"link": "edges"}))
        return node_link_data

    def get_ego_network_network(self, list_of_ego_networks: list[EgoGraph]):
        """
        Returns a networkX graph of ego networks.
        The nodes of the graph are the ego networks.
        The edges of the graph are the intersections of the ego networks.
        The weight of the edges is the jaccard index of the intersection.

        Parameters
        ----------
        list_of_ego_networks : list[EgoGraph]
            A list of ego networks.

            Returns
            -------
            networkX graph
                A networkX graph of ego networks.
        """
        ego_network_network = nx.Graph()

        # for each ego network calculate the intersection with all other ego networks
        # if the jaccard index is greater than 0, add an edge between the two ego networks
        # with the jaccard index as weight

        for ego_network in list_of_ego_networks:
            neighborsList = ego_network.get_neighbors().values()
            # flatten list of lists
            neighborsList = [ego_network.node] + [
                item for sublist in neighborsList for item in sublist
            ]
            # print(neighbors)
            # add node to ego network network size of the node corresponds to the size of the ego network
            ego_network_network.add_node(
                ego_network.node,
                size=ego_network.nx_graph.number_of_nodes(),
                name=ego_network.node,
                x=0,
                y=0,
                id=ego_network.node,
                neighbors=neighborsList,
                density=ego_network.density,
            )
            for other_ego_network in list_of_ego_networks:
                if ego_network != other_ego_network:
                    intersection = ego_network.get_intersection(other_ego_network)
                    if intersection["jaccard"] > 0:
                        ego_network_network.add_edge(
                            ego_network.node,
                            other_ego_network.node,
                            weight=intersection["jaccard"],
                        )
        return ego_network_network
