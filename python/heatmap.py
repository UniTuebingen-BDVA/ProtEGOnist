import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
from pathlib import Path
import requests
import os
import sys

# temporary
sys.setrecursionlimit(100000)

cwdPath: Path = Path(os.getcwd())
dataPath = Path(
    cwdPath / "biovis_challenge" / "data" / "ProCan-DepMapSanger_protein_matrix_8498_averaged.txt"
)
dataURL = "https://bdvanc.uni-tuebingen.de/index.php/s/BerA8DoTy8EEPsM/download/ProCan-DepMapSanger_protein_matrix_8498_averaged.txt"

print(dataPath)

def getData() -> None:
    dataTargetPath: Path = dataPath

    if not dataTargetPath.parent.exists():
        os.mkdir(dataTargetPath.parent)
    if dataTargetPath.exists():
        print("data already downloaded")
        return
    print("getData" + str(dataTargetPath))
    try:
        r: requests.Response = requests.get(dataURL)
        with open(dataTargetPath, "wb") as f:
            f.write(r.content)
    except OSError:
        print("FAILED to download: " + str(dataTargetPath))


def showHeatmap() -> None:
    # Read the data
    df: pd.DataFrame = pd.read_csv( 
        str(dataPath), sep="\t", index_col=0, header=0, engine="python"
    )
    print(df.shape)
    df = df.dropna(axis=1, how="all")
    print(df.shape)
    #df.fillna(0, inplace=True)

    print(df.head(5))

    # sns.histplot(df.iloc[920, :])
    # plt.show()
    cmap = ListedColormap(['black'] + sns.color_palette("RdBu_r", 256).as_hex())
    cg = sns.clustermap(
        df,
        cmap=cmap,
        col_cluster=True,
        figsize=(100, 50),
        center=0,
        vmin=-5,
        vmax=5,
        z_score=1,
    )
    cg.savefig("heatmap.png", format="png", dpi=100)
    plt.show()


getData()
showHeatmap()
