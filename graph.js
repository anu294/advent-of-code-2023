class Graph {
  // defining vertex array and
  // adjacent list
  constructor(options) {
    this.AdjList = new Map();
    this.options = options ?? {directed: false};
  }

  addVertex(v) {
    if (!this.AdjList.has(v)) this.AdjList.set(v, new Set());
  }
  addEdge(v, w) {
    if (!this.options.directed && this.AdjList.get(w)?.has(v)) {
      return;
    }
    this.AdjList.get(v).add(w);
  }

  getChildren(v) {
    return this.AdjList.get(v);
  }
  getNonLeafNodes() {
    return Array.from(this.AdjList.keys());
  }

  // Main DFS method
  dfs(startingNode, callback) {
    var visited = {};

    this.DFSUtil(startingNode, visited, startingNode, callback);
  }

  // Recursive function which process and explore
  // all the adjacent vertex of the vertex with which it is called
  DFSUtil(vertex, visited, startingNode, callback) {
    visited[vertex] = true;
    console.log(vertex);

    callback(vertex, startingNode);

    var get_neighbours = this.AdjList.get(vertex);
    console.log("get_neighbours", get_neighbours);

    get_neighbours.forEach((neighbor, i) => {
      if (!visited[neighbor])
        this.DFSUtil(neighbor, visited, startingNode, callback);
    });
  }

  printGraph() {
    // get all the vertices
    var get_keys = this.AdjList.keys();

    // iterate over the vertices
    for (var i of get_keys) {
      // get the corresponding adjacency list
      // for the vertex
      var get_values = this.AdjList.get(i);
      var conc = "";

      for (var j of get_values) conc += j + " ";

      // print the vertex and its adjacency list
      console.log(i + " -> " + conc);
    }
  }
}
module.exports = Graph;