import networkx as nx
from server.python_scripts.egoGraph import EgoGraph
import random
from server.python_scripts.egoGraph import Intersection


# generate a dorogovtsev_goltsev_mendes_graph for the test data
def generate_dgm_radar_data():
    G = nx.dorogovtsev_goltsev_mendes_graph(7)
    # add attributes to nodes with the name of the node being the id
    for node in G.nodes:
        G.nodes[node]["name"] = str(node)
    random.seed(31)
    # add a class attribute randomly out of ['A','B', 'C', 'D', 'E']  to each node
    for node in G.nodes:
        G.nodes[node]["classification"] = random.choice(["A", "B", "C", "D", "E"])

    # print amount of nodes
    # print("Graph nodes: ", G.number_of_nodes())
    # generate 40 unique random numbers between 0 and 9842 with fixed seed
    random.seed(31)

    random_numbers = random.sample(range(0, 1093), 40)

    ego_networks = {i: EgoGraph.from_string_network(i, G) for i in random_numbers}
    return random_numbers, ego_networks


def generate_radar_data(string_graph: nx.Graph, target_node: str):
    random.seed(31)
    for node in string_graph.nodes:
        string_graph.nodes[node]["name"] = str(
            node
        )  # TODO: this is a side effect, we should think on how to handle the problem of the name attribute
        string_graph.nodes[node]["classification"] = random.choice(
            ["A", "B", "C", "D", "E"]
        )  # TODO same here

    tar_ego_graph = EgoGraph.from_string_network(target_node, string_graph)

    # generate 40 other ego networks from the string graph as a dictionary
    # with the center node as the key

    # draw 40 random names from the string graph
    random_nodes = random.sample(list(string_graph.nodes()), 40)

    # generate the networks
    ego_networks = {
        i: EgoGraph.from_string_network(i, string_graph) for i in random_nodes
    }
    return tar_ego_graph, ego_networks


def generate_dgm_ego_graph():
    G = nx.dorogovtsev_goltsev_mendes_graph(7)
    # add attributes to nodes with the name of the node being the id
    for node in G.nodes:
        G.nodes[node]["name"] = str(node)
    random.seed(31)
    # add a class attribute randomly out of ['A','B', 'C', 'D', 'E']  to each node
    for node in G.nodes:
        G.nodes[node]["classification"] = random.choice(["A", "B", "C", "D", "E"])
    random.seed(31)

    random_number = random.randint(0, 1093)
    return EgoGraph.from_string_network(random_number, G).get_graph_JSON()


def generate_random_ego_graph_string(string_graph: nx.Graph, target_node: str):
    # get a random node from the stringGraph

    return EgoGraph.from_string_network(target_node, string_graph).get_graph_JSON()


def generate_string_intersections_pickles(
    ego_dicts: dict[str, EgoGraph], tar_node: str
):
    # add a random classifcation (A-E) to each node in the ego_dicts
    for i in ego_dicts:
        for node in ego_dicts[i].nxGraph.nodes:
            ego_dicts[i].nxGraph.nodes[node]["classification"] = random.choice(
                ["A", "B", "C", "D", "E"]
            )

    # calculate the intersection of the target node and the nodes in the ego_dicts
    intersection_dict: dict[str, Intersection] = {
        i: ego_dicts[i].get_intersection(ego_dicts[tar_node]) for i in ego_dicts
    }
    # get the 40 nodes with the highest intersection by jaccard index
    highestProts = sorted(
        intersection_dict, key=lambda x: intersection_dict[x]["jaccard"], reverse=True
    )[:40]
    # randomize the order of highestProts
    random.shuffle(highestProts)

    # make a subset of the ego_dicts with only the 40 nodes
    highestDict = {i: ego_dicts[i] for i in highestProts}

    return highestProts, highestDict


def generate_string_intersections_top(
    string_graph: nx.Graph, top_nodes: list[str], tar_node: str
):
    # get the 40 nodes with the highest intersection by jaccard index
    highestProts = top_nodes
    # randomize the order of highestProts
    # random.shuffle(highestProts)
    # generate EgoGraphs from the highestProts
    highestDict = {
        i: EgoGraph.from_string_network(i, string_graph) for i in highestProts
    }
    # add a random classifcation (A-E) to each node in the ego_dicts
    for i in highestDict:
        for node in highestDict[i].nxGraph.nodes:
            highestDict[i].nxGraph.nodes[node]["classification"] = random.choice(
                ["A", "B", "C", "D", "E"]
            )
    tar_ego_graph = EgoGraph.from_string_network(tar_node, string_graph)

    return tar_ego_graph, highestDict


## test the function
# if __name__ == "__main__":
#     b, a = generateTestGraphData()
#     # print the json from a random ego network
#     print(b)
#     print(a[b[0]].getGraphJSON())
