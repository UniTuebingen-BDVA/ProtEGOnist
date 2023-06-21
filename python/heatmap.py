import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from pathlib import Path
import wget
import os


cwdPath: Path = Path(os.getcwd())
dataTargetpath = cwdPath / "ProCan-DepMapSanger_protein_matrix_8498_averaged.txt"


def getData():
    dataSource = "https://bdvanc.uni-tuebingen.de/index.php/s/BerA8DoTy8EEPsM/download/ProCan-DepMapSanger_protein_matrix_8498_averaged.txt"
    if os.path.exists(dataTargetpath):
        print("data already dwonloaded")
        return
    print("getData" + str(dataTargetpath))
    try:
        wget.download(dataSource, str(dataTargetpath))
    except OSError:
        print("FAILED: to Download: " + str(dataTargetpath))


getData()
dataPath: Path = dataTargetpath
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
