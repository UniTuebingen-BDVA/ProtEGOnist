import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from pathlib import Path
import wget
import os


cwdPath: Path = Path(os.getcwd())
dataPath = Path(
    cwdPath.parent / "data" / "ProCan-DepMapSanger_protein_matrix_8498_averaged.txt"
)
dataURL = "https://bdvanc.uni-tuebingen.de/index.php/s/BerA8DoTy8EEPsM/download/ProCan-DepMapSanger_protein_matrix_8498_averaged.txt"


def getData():
    dataTargetPath: Path = dataPath

    if not dataTargetPath.parent.exists():
        os.mkdir(dataTargetPath.parent)
    if dataTargetPath.exists():
        print("data already downloaded")
        return
    print("getData" + str(dataTargetPath))
    try:
        wget.download(dataURL, str(dataTargetPath))
    except OSError:
        print("FAILED to download: " + str(dataTargetPath))


def showHeatmap():
    # Read the data
    df: pd.DataFrame = pd.read_csv(
        str(dataPath), sep="\t", index_col=0, header=0, engine="python"
    )
    print(df.shape)
    df = df.dropna(axis=1, how="all")
    print(df.shape)
    df.fillna(0, inplace=True)

    print(df.head(5))

    cg = sns.clustermap(
        df,
        cmap="RdBu_r",
        col_cluster=False,
        center=0,
        figsize=(20, 20),
        vmin=-5,
        vmax=5,
        z_score=1,
    )
    plt.show()


getData()
showHeatmap()
