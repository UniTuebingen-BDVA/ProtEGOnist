from server.python_scripts.dataIO import read_metadata, parse_distance_matrix
import networkx as nx


def read_example_string(here):
    # Read the STRING network from the input file
    try:
        network = nx.read_graphml(
            here / "data" / "example_PPIs" / "graphml_string_cleaned.graphml")
        print("Loaded string graph ", len(network.nodes))
    except FileNotFoundError:
        print(
            f"No graphml file found in {here / 'data'}. Make sure you added it.")
    # Read the top intersections from the input file
    try:
        top_intersections_dist = parse_distance_matrix(
            here / "data" / "example_PPIs" / "distance_matrix.txt.gz")
    except FileNotFoundError:
        print(
            f"No json file found in {here / 'data'}. Make sure you added it.")
    try:
        table_data, classification_dict = read_metadata(
            here / "data" / "example_PPIs" / "metadata_proteins.csv", "brite", network.nodes)

    except FileNotFoundError:
        print(
            f"No metadata file found in {here / 'data'}. Make sure you added it.")

    try:
        with open(here / "data" / "example_PPIs" / "important_nodes.txt", "r") as f:
            important_nodes = [line.strip() for line in f]
            print("Loaded relevant_proteins ", len(important_nodes))

    except FileNotFoundError:
        print(
            f"No metadata file found in {here / 'data'}. Make sure you added it.")

    return {
        "network": network,
        "top_intersections": top_intersections_dist,
        "classification": classification_dict,
        "metadata": table_data,
        "overview_nodes": important_nodes,
        "quantify_by": "drug_name",
        "quantify_type": "categorical",
        "classify_by": "brite",
        "name_nodes": "x_id",
        "show_tooltip": ["drug_name", "brite"],
        "start_radar": 'P63279',
        "start_selected": ['Q99459', 'Q01518', 'P61421', 'P52565', 'P00568', 'Q9NRN7', 'P63279']

    }


def read_example_string_modified(here):
    # Read the STRING network from the input file
    try:
        network = nx.read_graphml(
            here / "data" / "example_PPIs2" / "graphml_string_cleaned.graphml")
        print("Loaded string graph ", len(network.nodes))
    except FileNotFoundError:
        print(
            f"No graphml file found in {here / 'data'}. Make sure you added it.")
    # Read the top intersections from the input file
    try:
        top_intersections = parse_distance_matrix(
            here / "data" / "example_PPIs2" / "distance_matrix.txt.gz")
    except FileNotFoundError:
        print(
            f"No json file found in {here / 'data'}. Make sure you added it.")
    try:
        table_data, classification_dict = read_metadata(
            here / "data" / "example_PPIs2" / "metadata_proteins.csv", "x_id", network.nodes)

    except FileNotFoundError:
        print(
            f"No metadata file found in {here / 'data'}. Make sure you added it.")

    try:
        with open(here / "data" / "example_PPIs2" / "important_nodes.txt", "r") as f:
            important_nodes = [line.strip() for line in f]
            print("Loaded relevant_proteins ", len(important_nodes))

    except FileNotFoundError:
        print(
            f"No metadata file found in {here / 'data'}. Make sure you added it.")

    return {
        "network": network,
        "top_intersections": top_intersections,
        "classification": classification_dict,
        "metadata": table_data,
        "overview_nodes": important_nodes,
        "quantify_by": "mySamplingNumber",
        "quantify_type": "quantitative",
        "classify_by": "x_id",
        "name_nodes": "x_id",
        "show_tooltip": ["drug_name"],
        "start_radar": 'Q9NRX2',
        "start_selected": ["P07900", "P62304", "P05412", "Q9NRX2", "P35222"]
    }


def read_example_metagenome(here):
    # Read the network from the input file
    try:
        network = nx.read_weighted_edgelist(
            here / "data" / "metagenome_data" / "edge_list_network.tsv", delimiter="\t")
        print("Loaded string graph ", len(network.nodes))
    except Exception as e:
        print(e)

    # Read the top intersections from the input file
    try:
        top_intersections = parse_distance_matrix(
            here / "data" / "metagenome_data" / "metagenome_distance.txt.gz")
    except FileNotFoundError:
        print(
            f"No json file found in {here / 'data'}. Make sure you added it.")
    try:
        table_data, classification_dict = read_metadata(
            here / "data" / "metagenome_data" / "metadata_metagenome.csv", "taxa", network.nodes)

    except FileNotFoundError:
        print(
            f"No metadata file found in {here / 'data'}. Make sure you added it.")

    try:
        with open(here / "data" / "metagenome_data" / "metagenome_important_nodes.txt", "r") as f:
            important_nodes = [line.strip() for line in f]
            print("Loaded relevant_proteins ", len(important_nodes))

    except FileNotFoundError:
        print(
            f"No metadata file found in {here / 'metagenome_data'}. Make sure you added it.")

    return {
        "network": network,
        "top_intersections": top_intersections,
        "classification": classification_dict,
        "metadata": table_data,
        "overview_nodes": important_nodes,
        "quantify_by": "median",
        "quantify_type": "quantitative",
        "classify_by": "taxa",
        "name_nodes": "nodeName",
        "show_tooltip": ["taxa", "median"],
        "start_radar": important_nodes[0],
        "start_selected": important_nodes[:5] if len(important_nodes) > 5 else important_nodes
    }
