# here functions generating a network of ego networks are defined

# import egoNetwork
import networkx as nx
from server.python_scripts.egoGraph import EgoGraph


def getEgoNetworkNetwork(list_of_ego_networks: list[EgoGraph]):
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
    egoNetworkNetwork = nx.Graph()

    # for each ego network calculate the intersection with all other ego networks
    # if the jaccard index is greater than 0, add an edge between the two ego networks
    # with the jaccard index as weight

    for ego_network in list_of_ego_networks:
        # add node to ego network network size of the node corresponds to the size of the ego network
        egoNetworkNetwork.add_node(
            ego_network.node, size=ego_network.nxGraph.number_of_nodes()
        )
        for other_ego_network in list_of_ego_networks:
            if ego_network != other_ego_network:
                intersection = ego_network.get_intersection(other_ego_network)
                if intersection["jaccard"] > 0:
                    egoNetworkNetwork.add_edge(
                        ego_network.node,
                        other_ego_network.node,
                        weight=intersection["jaccard"],
                    )
    return egoNetworkNetwork
