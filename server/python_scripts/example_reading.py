from server.python_scripts.dataIO import read_metadata, parse_distance_matrix
import networkx as nx


def read_example_string(here):
    # Read the STRING network from the input file
    try:
        network = nx.read_graphml(
            here / "example_PPIs" / "graphml_string_cleaned.graphml"
        )
        print("Loaded string graph ", len(network.nodes))
    except FileNotFoundError:
        print(f"No graphml file found in {here / 'data'}. Make sure you added it.")
    # Read the top intersections from the input file
    try:
        top_intersections_dist = parse_distance_matrix(
            here / "example_PPIs" / "distance_matrix.txt.gz"
        )
    except FileNotFoundError:
        print(f"No json file found in {here / 'data'}. Make sure you added it.")
    try:
        table_data, classification_dict = read_metadata(
            here / "example_PPIs" / "newMeta.csv",
            "brite",
            network.nodes,
            sep="\t",
        )

    except FileNotFoundError:
        print(f"No metadata file found in {here / 'data'}. Make sure you added it.")

    try:
        with open(here / "example_PPIs" / "important_nodes.txt", "r") as f:
            important_nodes = [line.strip() for line in f]
            print("Loaded relevant_proteins ", len(important_nodes))

    except FileNotFoundError:
        print(f"No metadata file found in {here / 'data'}. Make sure you added it.")

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
        "show_tooltip": ["drug_name", "brite", "pathway"],
        "start_radar": "Q9ULU4",
        "start_selected": ["Q9ULU4", "P63279", "Q14157", "Q9UBT2"],
    }


def read_example_string_modified(here):
    # Read the STRING network from the input file
    try:
        network = nx.read_graphml(
            here / "example_PPIs2" / "graphml_string_cleaned.graphml"
        )
        print("Loaded string graph ", len(network.nodes))
    except FileNotFoundError:
        print(f"No graphml file found in {here / 'data'}. Make sure you added it.")
    # Read the top intersections from the input file
    try:
        top_intersections = parse_distance_matrix(
            here / "example_PPIs2" / "distance_matrix.txt.gz"
        )
    except FileNotFoundError:
        print(f"No json file found in {here / 'data'}. Make sure you added it.")
    try:
        table_data, classification_dict = read_metadata(
            here / "example_PPIs2" / "metadata_proteins.csv",
            "x_id",
            network.nodes,
        )

    except FileNotFoundError:
        print(f"No metadata file found in {here / 'data'}. Make sure you added it.")

    try:
        with open(here / "example_PPIs2" / "important_nodes.txt", "r") as f:
            important_nodes = [line.strip() for line in f]
            print("Loaded relevant_proteins ", len(important_nodes))

    except FileNotFoundError:
        print(f"No metadata file found in {here / 'data'}. Make sure you added it.")

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
        "start_radar": "Q9NRX2",
        "start_selected": ["P07900", "P62304", "P05412", "Q9NRX2", "P35222"],
    }


def read_example_IEEEcoAuthor(here):
    try:
        network = nx.read_graphml(here / "IEEEcoAuthor" / "IEEECoAuthorData.graphml")
        print("Loaded IEEE graph ", len(network.nodes))
    except FileNotFoundError:
        print(f"No graphml file found in {here / 'data'}. Make sure you added it.")
    # Read the top intersections from the input file
    try:
        top_intersections = parse_distance_matrix(
            here / "IEEEcoAuthor" / "distance_IEEE.txt.gz"
        )
    except FileNotFoundError:
        print(f"No json file found in {here / 'data'}. Make sure you added it.")
    try:
        table_data, classification_dict = read_metadata(
            here / "IEEEcoAuthor" / "IEEEMetadata.csv",
            "institution",
            network.nodes,
            sep=";",
        )

    except FileNotFoundError:
        print(f"No metadata file found in {here / 'data'}. Make sure you added it.")

    try:
        with open(here / "IEEEcoAuthor" / "important_nodes_IEEE.txt", "r") as f:
            important_nodes = [line.strip() for line in f]
            print("Loaded relevant_proteins ", len(important_nodes))

    except FileNotFoundError:
        print(f"No metadata file found in {here / 'data'}. Make sure you added it.")

    return {
        "network": network,
        "top_intersections": top_intersections,
        "classification": classification_dict,
        "metadata": table_data,
        "overview_nodes": important_nodes,
        "quantify_by": "Documents",
        "quantify_type": "quantitative",
        "classify_by": "institution",
        "name_nodes": "nodeID",
        "show_tooltip": [
            "institution",
            "institutionCountry",
            "Documents",
            "Citations",
        ],
        "start_radar": "Huamin Qu",
        "start_selected": [
            "Huamin Qu",
            "Helwig Hauser",
            "Hanspeter Pfister",
            "Wei Chen 0001",
        ],
    }


def read_example_ecoli_full(here):
    try:
        network = nx.read_graphml(here / "ecoliFull" / "ecoliFull.graphml")
        print("Loaded Ecoli graph ", len(network.nodes))
    except FileNotFoundError:
        print(f"No graphml file found in {here / 'data'}. Make sure you added it.")
    # Read the top intersections from the input file
    try:
        top_intersections = parse_distance_matrix(
            here / "ecoliFull" / "distance_matrix.txt.gz"
        )
    except FileNotFoundError:
        print(f"No json file found in {here / 'data'}. Make sure you added it.")
    try:
        table_data, classification_dict = read_metadata(
            here / "ecoliFull" / "metadata_final.csv",
            "BRITEClass",
            network.nodes,
            sep=";",
        )

    except FileNotFoundError:
        print(f"No metadata file found in {here / 'data'}. Make sure you added it.")

    try:
        with open(here / "ecoliFull" / "important_nodes.txt", "r") as f:
            important_nodes = [line.strip() for line in f]
            print("Loaded relevant_proteins ", len(important_nodes))

    except FileNotFoundError:
        print(f"No metadata file found in {here / 'data'}. Make sure you added it.")

    return {
        "network": network,
        "top_intersections": top_intersections,
        "classification": classification_dict,
        "metadata": table_data,
        "overview_nodes": important_nodes,
        "quantify_by": "default",
        "quantify_type": "quantitative",
        "classify_by": "BRITEClass",
        "name_nodes": "display name",
        "show_tooltip": [
            "BRITEClass",
            "keggID",
            "canonical name",
            "description",
        ],
        "start_radar": "147590",
        "start_selected": ["147590", "143960", "149273", "144554"],
    }
