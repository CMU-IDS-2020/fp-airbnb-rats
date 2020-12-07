import streamlit as st
import pandas as pd
import plotly.express as px
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import AgglomerativeClustering
from sklearn.manifold import TSNE
import plotly.figure_factory as ff
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import seaborn as sns


@st.cache(allow_output_mutation=True)
def load_data():
    input_data = pd.read_csv('datasets_Kingscourt_Kingscourt_Piquant_wt-percent.csv')
    return input_data


def normalize(original_df):
    to_scale = StandardScaler()
    new_df = to_scale.fit_transform(original_df)
    return new_df


def interpret(clustered_df, clustering_type):
    st.write("Interpretation:")


if __name__ == "__main__":
    # Read in the data
    df = load_data()
    features = df[['Al_%', 'Si_%', 'S_%', 'K_%', 'Ca_%', 'Ti_%', 'V_%', 'Mn_%', 'Fe_%', 'Ni_%', 'Cu_%', 'Zn_%', 'As_%',
                     'Y_%', 'Sr_%', 'Zr_%', 'Pb_%', 'Rb_%', 'Bi_%', 'U_%', 'Co_%']]
    st.title("Clustering")

    techniques = ["K-means", "Hierarchical", "No clusters"]
    clustering_method = st.sidebar.selectbox("Clustering Technique", techniques)

    if clustering_method == techniques[0]:
        st.write("K-means results")
        features = normalize(features)

        K = st.sidebar.number_input("Please enter the number of clusters (K):", value=5)
        dr = st.sidebar.radio(label = "Use dimensionality reduction while clustering?",options=('No', 'PCA', 't-SNE'))

        if dr == "PCA":
            variance_percent = st.sidebar.number_input("Percentage of variance to be retained:", value=0.95)
            pca = PCA(variance_percent)
            reduced_data = pca.fit_transform(features)

            clusters_data = reduced_data

        elif dr == 't-SNE':
            n_components = st.sidebar.number_input("Please enter the number of dimensions: ", value=2)
            perplexity = st.sidebar.number_input("Please enter the perplexity: ", value=30)

            tsne = TSNE(n_components=n_components, perplexity=perplexity, n_iter=250)
            reduced_data = tsne.fit_transform(features)

            clusters_data = reduced_data

        else:
            clusters_data = features

        k_means = KMeans(n_clusters=K)
        y = k_means.fit_predict(clusters_data)

        df['Cluster'] = y
        df['Cluster'] = df['Cluster'].apply(str)
        fig = px.scatter_3d(df, x=df['X'], y=df['Y'], z=df['Z'], color=df['Cluster'], width=700, height=700)
        st.plotly_chart(fig)

        interpret(df, "k")


    elif clustering_method == techniques[1]:
        st.write("Hierarchical results")
        features = normalize(features)

        fig = ff.create_dendrogram(features)
        fig.update_layout(width=800, height=600)
        st.plotly_chart(fig)

        num_clusters = st.sidebar.number_input("Please enter the number of clusters:", value=3)
        linkage_type = st.sidebar.radio(label="Linkage", options=('ward', 'complete', 'average', 'single'))

        cluster = AgglomerativeClustering(n_clusters=num_clusters, affinity='euclidean', linkage=linkage_type)
        predicted_clusters = cluster.fit_predict(features)
        df['hierarchical_cluster'] = predicted_clusters
        df['hierarchical_cluster'] = df['hierarchical_cluster'].apply(str)
        fig = px.scatter_3d(df, x=df['X'], y=df['Y'], z=df['Z'], color=df['hierarchical_cluster'], width=700, height=700)
        st.plotly_chart(fig)

        interpret(df, "h")

    else:
        maxOrMin = ["max", "min"]
        maxMinOption = st.sidebar.selectbox("Group by Maximum/Minimum", maxOrMin)
        if maxMinOption == maxOrMin[0]:
            st.write("Grouping by max element")
            df['maxValue'] = features.idxmax(axis=1)
            fig = px.scatter_3d(df, x=df['X'], y=df['Y'], z=df['Z'], color=df['maxValue'], width=700, height=700)
            st.plotly_chart(fig)
        else:
            st.write("Grouping by min element")
            df['minValue'] = features.idxmin(axis=1)
            fig = px.scatter_3d(df, x=df['X'], y=df['Y'], z=df['Z'], color=df['minValue'], width=700, height=700)
            st.plotly_chart(fig)


    dimensionality_reduction_options = ["None", "PCA", "t-SNE"]
    st.sidebar.write("Visualize Dimensionality Reduction?")
    dr_method = st.sidebar.selectbox("Method", dimensionality_reduction_options)

    if dr_method == dimensionality_reduction_options[1]:
        l=1

    elif dr_method == dimensionality_reduction_options[2]:
        perplexity = st.sidebar.number_input("Please enter the perplexity: ", value=30)
        tsne_viz = TSNE(n_components=2, perplexity=perplexity, n_iter=250)
        tsne_results = tsne_viz.fit_transform(features)

        df['tsne-2d-one'] = tsne_results[:, 0]
        df['tsne-2d-two'] = tsne_results[:, 1]

        fig = px.scatter(df, x=df['tsne-2d-one'], y=df['tsne-2d-two'], color=df['maxValue'], width=700, height=700)
        st.plotly_chart(fig)
