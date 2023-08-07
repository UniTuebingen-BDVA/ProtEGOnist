import pickle
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns


def read_pckl(file_name):
    with open(file_name, 'rb') as f:
        return pd.read_pickle(f)


def visualize_coverage_over_size(df):
    # Visualize 2x2 plot of coverage over size of protein set
    fig, axs = plt.subplots(ncols=2, nrows=2)
    sns.lineplot(x='Number of EGO centers',
                 y='Number of proteins', data=df, ax=axs[0, 0])
    sns.lineplot(x='Number of EGO centers',
                 y='Number of edges', data=df, ax=axs[1, 0])
    sns.lineplot(x='Number of EGO centers',
                 y='Coverage of proteins', data=df, ax=axs[0, 1])
    sns.lineplot(x='Number of EGO centers',
                 y='Coverage of edges', data=df, ax=axs[1, 1])
    plt.suptitle("Differences over size of EGO center set")
    # remove xlabel from all but bottom plots
    axs[0, 0].set_xlabel("")
    axs[0, 1].set_xlabel("")
    axs[1, 1].set_xlabel("Number of EGO centers")
    axs[1, 0].set_xlabel("Number of EGO centers")
    # Change figsize
    fig.set_figheight(8)
    fig.set_figwidth(10)
    # Save the figure
    # plt.show()
    plt.savefig('coverage_over_EGOCentersize.png')
    plt.close()


def visualize_coverage_over_iterations(df):
    fig, axs = plt.subplots(ncols=2, nrows=2, sharex=True)

    sns.barplot(x='type', y='Number of proteins',
                data=df, errorbar="sd", ax=axs[0, 0])
    sns.barplot(x='type', y='Number of edges',
                data=df, errorbar="sd", ax=axs[1, 0])
    sns.barplot(x='type', y='Coverage of proteins',
                data=df, errorbar="sd", ax=axs[0, 1])
    sns.barplot(x='type', y='Coverage of edges',
                data=df, errorbar="sd", ax=axs[1, 1])
    fig.subplots_adjust(top=0.9)
    axs[1, 0].set_xticks([0, 1, 2, 3])
    axs[1, 0].set_xticklabels(["Published Set", "Random set",
                               "Random set\nwith neigbour \nremoval", "Random set\nwith filter\n(n>20)"])
    # remove xlabel from all but bottom plots
    axs[0, 0].set_xlabel("")
    axs[0, 1].set_xlabel("")
    axs[1, 1].set_xlabel("Sampling Method")
    axs[1, 0].set_xlabel("Sampling Method")

    # Change figsize
    fig.set_figheight(8)
    fig.set_figwidth(12)
    # plt.tight_layout()
    plt.suptitle(
        "Differences across different sampling methods for the EGO centers",  y=0.98)
    # plt.xlabel("Sampling method")
    # Save the figure
    # plt.show()
    plt.savefig('coverage_over_sampling.png')
    plt.close()


def main():
    normal_set = read_pckl('coverage.pkl')
    random_set_with_rep = read_pckl('random_set_with_rep.pkl')
    random_set_without_rep = read_pckl('random_set_without_rep.pkl')
    random_set_without_rep_and_filter = read_pckl(
        'random_set_with_filter20.pkl')

    visualize_coverage_over_size(normal_set)
    normal_set["type"] = "normal"
    subset_normal_set = normal_set[normal_set["Number of EGO centers"] == 91]
    random_set_with_rep["type"] = "random_set_with_rep"
    random_set_without_rep["type"] = "random_set_without_rep"
    random_set_without_rep_and_filter["type"] = "random_set_without_rep_and_filter"
    df = pd.concat(
        [subset_normal_set, random_set_with_rep, random_set_without_rep, random_set_without_rep_and_filter]).reset_index(drop=True)

    visualize_coverage_over_iterations(df)

    # Summarize the data columnwise
    df = df.groupby("type").agg(
        {"Number of proteins": ["mean", "std", "size"], "Number of edges": ["mean", "std", "size"], "Coverage of proteins": ["mean", "std", "size"], "Coverage of edges": ["mean", "std", "size"]})
    print(df)


main()
