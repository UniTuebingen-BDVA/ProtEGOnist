import pandas as pd
import networkx as nx


def read_excel_sheet(path):
    return pd.read_excel(path, header=0, sheet_name=0)


def read_brite_hierarchy(path):
    return pd.read_csv(path, header=0, sep=",")


def main():
    drug_interactions = read_excel_sheet(
        "/Users/pacha/Documents/github_projects/Biovis-Challenge23/BiovisChallenge2023/server/data/s5_with_uniprot.xlsx")
    drug_interactions_per_protein = drug_interactions.groupby("nodeID").agg(
        {"drug_name": lambda x: ";".join(set(list(x))),
         "x_id": lambda x: ";".join(set(list(x))),
         "cancer_gene": lambda x: list(set(list(x)))[0] if len(set(list(x))) == 1 else ";".join(set([str(it) for it in x])),
         })
    brite_hierarchy = read_brite_hierarchy(
        "/Users/pacha/Documents/github_projects/Biovis-Challenge23/BiovisChallenge2023/server/data/uniprot_brite.csv").drop_duplicates()

    # Left Join drug_interactions_per_protein and brite_hierarchy on nodeID
    drug_interactions_per_protein = drug_interactions_per_protein.merge(
        brite_hierarchy, how="left", on="nodeID")
    print(drug_interactions_per_protein.head())
    print(drug_interactions_per_protein.shape[0])
    print(brite_hierarchy.shape[0])
    # export to csv without index and with NaNs
    drug_interactions_per_protein.to_csv(
        "/Users/pacha/Documents/github_projects/Biovis-Challenge23/BiovisChallenge2023/server/data/metadata_proteins.csv",
        index=False, na_rep="none")
    network = nx.read_graphml(
        "/Users/pacha/Documents/github_projects/Biovis-Challenge23/BiovisChallenge2023/server/data/graphml_string_cleaned.graphml")
    with open("/Users/pacha/Documents/github_projects/Biovis-Challenge23/BiovisChallenge2023/server/data/encounteredNodes.txt", "w") as f:
        f.write("\n".join(network.nodes()))


if __name__ == "__main__":
    main()
