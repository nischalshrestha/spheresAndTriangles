/* GLOBAL CONSTANTS AND VARIABLES */

// local copies of JSON files for testing (curently same as files from github)
var inputSpheres = [
{"x": 0.25, "y": 0.25, "z": 0.5, "r":0.1, "ambient": [0.1,0.1,0.1], "diffuse": [0.6,0.0,0.0], "specular": [0.3,0.3,0.3], "n":1},
{"x": 0.25, "y": 0.75, "z": 0.5, "r":0.1, "ambient": [0.1,0.1,0.1], "diffuse": [0.0,0.6,0.0], "specular": [0.3,0.3,0.3], "n":3},
{"x": 0.75, "y": 0.75, "z": 0.5, "r":0.1, "ambient": [0.1,0.1,0.1], "diffuse": [0.0,0.0,0.6], "specular": [0.3,0.3,0.3], "n":5},
{"x": 0.75, "y": 0.25, "z": 0.5, "r":0.1, "ambient": [0.1,0.1,0.1], "diffuse": [0.6,0.0,0.6], "specular": [0.3,0.3,0.3], "n":7},
{"x": 0.5, "y": 0.5, "z": 0.5, "r":0.15, "ambient": [0.1,0.1,0.1], "diffuse": [0.6,0.6,0.0], "specular": [0.3,0.3,0.3], "n":9}
];

var inputTriangles = [
  {
    "material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.6,0.4,0.4], "specular": [0.3,0.3,0.3], "n":11},
    "vertices": [[0.15, 0.4, 0.75],[0.25, 0.6, 0.75],[0.35,0.4,0.75]],
    "normals": [[0, 0, -1],[0, 0, -1],[0, 0, -1]],
    "triangles": [[0,1,2]]
  },
  {
    "material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.4,0.6,0.4], "specular": [0.3,0.3,0.3], "n":13},
    "vertices": [[0.4, 0.65, 0.75],[0.4, 0.85, 0.75],[0.6,0.85,0.75],[0.6,0.65,0.75]],
    "normals": [[0, 0, -1],[0, 0, -1],[0, 0, -1],[0, 0, -1]],
    "triangles": [[0,1,2],[2,3,0]]
  },
  {
    "material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.4,0.4,0.6], "specular": [0.3,0.3,0.3], "n":15},
    "vertices": [[0.65, 0.4, 0.75],[0.75, 0.6, 0.75],[0.85,0.4,0.75]],
    "normals": [[0, 0, -1],[0, 0, -1],[0, 0, -1]],
    "triangles": [[0,1,2]]
  },
  {
    "material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.6,0.6,0.4], "specular": [0.3,0.3,0.3], "n":17},
    "vertices": [[0.4, 0.15, 0.75],[0.4, 0.35, 0.75],[0.6,0.35,0.75],[0.6,0.15,0.75]],
    "normals": [[0, 0, -1],[0, 0, -1],[0, 0, -1],[0, 0, -1]],
    "triangles": [[0,1,2],[2,3,0]]
  }
];

/* assignment specific globals */
const WIN_Z = 0;  // default graphics window z coord in world space
const WIN_LEFT = 0; const WIN_RIGHT = 1;  // default left and right x coords in world space
const WIN_BOTTOM = 0; const WIN_TOP = 1;  // default top and bottom y coords in world space
const INPUT_TRIANGLES_URL = "https://ncsucgclass.github.io/prog2/triangles.json"; // triangles file loc
const INPUT_SPHERES_URL = "https://ncsucgclass.github.io/prog2/spheres.json"; // spheres file loc

/* Variables for the View, Light, and Reflectivity constants */
var Eye = new vec3.fromValues(0.5, 0.5, -0.5); // default eye position in world space
var Center = new vec3.fromValues(0.5, 0.5, 0); // default eye position in world space
var LookUp = new vec3.fromValues(0, 1.0, 0); // default eye position in world space
var LightLocation = new Float32Array([-2, -4, -5]); // Had to negate x,y and inc z to replicate solution
var LightColor = new Float32Array([1, 1, 1, 1]);
var AmbientR = new Float32Array([0.1, 0.1, 0.1]);
var SpecularR = new Float32Array([0.3, 0.3, 0.3]);

// TODO maintain the state for each object (Tri or Sphere) regarding its
// To highlight, set the selection's
// ambient and diffuse reflectivity to (0.5,0.5,0), specular to (0,0,0).
// To turn highlighting off, use normal lighting again.
var hSpecular = new Float32Array([0, 0, 0]);
var hAmbient = new Float32Array([0.5, 0.5, 0]);
var hDiffuse = new Float32Array([0.5, 0.5, 0]);

/* webgl globals */
var gl = null; // the all powerful gl object. It's all here folks!
var shaderProgram;

// Triangle
function Triangle(
  id, positionBuffer, indexBuffer, bufferSize, normalBuffer,
  colorBuffer, highlightBuffer, ambient, specular, coherence, highlighted,
  mvMatrix, pMatrix, xyz, xyzLocal, rotate, rotateLocal)
{
  this.id = id;
  this.positionBuffer = positionBuffer;
  this.indexBuffer = indexBuffer;
  this.bufferSize = bufferSize;
  this.colorBuffer = colorBuffer;
  this.highlightBuffer = highlightBuffer;
  this.normalBuffer = normalBuffer;
  this.ambient = ambient;
  this.specular = specular;
  this.coherence = coherence;
  this.highlighted = highlighted;
  this.mvMatrix = mvMatrix;
  this.pMatrix = pMatrix;
  this.xyz = xyz;
  this.xyzLocal = xyzLocal;
  this.rotate = rotate;
  this.rotateLocal = rotateLocal;
  console.log("local: "+this.xyzLocal);
  // Sets global xyz for translation
  this.setXYZ = function(x, y, z)
  {
    this.xyz = [x, y, z];
  };
  // Sets local xyz for translation
  this.setXYZLocal = function(x, y, z)
  {
    this.xyzLocal = [x, y, z];
  };
  // Sets global xyz for rotate[XYZ]
  this.setRotate = function(x, y, z)
  {
    this.rotate = [x, y, z];
  };
  // Sets local xyz for rotate[XYZ]
  this.setRotateLocal = function(x, y, z)
  {
    this.rotateLocal = [x, y, z];
  };
  this.setHighlighted = function(highlighted)
  {
    this.highlighted = highlighted;
  };
}
var tris = [];

// Sphere
function Sphere(
  id, positionBuffer, indexBuffer, bufferSize, normalBuffer, colorBuffer,
  highlightBuffer, ambient, specular, coherence, highlighted, mvMatrix, pMatrix,
  xyz, xyzLocal, rotate, rotateLocal)
{
  this.id = id;
  this.positionBuffer = positionBuffer;
  this.indexBuffer = indexBuffer;
  this.bufferSize = bufferSize;
  this.colorBuffer = colorBuffer;
  this.highlightBuffer = highlightBuffer;
  this.normalBuffer = normalBuffer;
  this.ambient = ambient;
  this.specular = specular;
  this.coherence = coherence;
  this.mvMatrix = mvMatrix;
  this.pMatrix = pMatrix;
  this.xyz = xyz;
  this.xyzLocal = xyzLocal;
  this.rotate = rotate;
  this.rotateLocal = rotateLocal;
  // Sets global xyz for translation
  this.setXYZ = function(x, y, z)
  {
    this.xyz = [x, y, z];
  };
  // Sets local xyz for translation
  this.setXYZLocal = function(x, y, z)
  {
    this.xyzLocal = [x, y, z];
  };
  // Sets global xyz for rotate[XYZ]
  this.setRotate = function(x, y, z)
  {
    this.rotate = [x, y, z];
  };
  // Sets local xyz for rotate[XYZ]
  this.setRotateLocal = function(x, y, z)
  {
    this.rotateLocal = [x, y, z];
  };
  this.setHighlighted = function(highlighted)
  {
    this.highlighted = highlighted;
  };
}
var spheres = [];

// ASSIGNMENT HELPER FUNCTIONS

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response);
        } // end if good params
    } // end try

    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input spheres

// set up the webGL environment
function setupWebGL() {

    // Get the canvas and context
    var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    gl = canvas.getContext("webgl"); // get a webgl object from it

    try {
      if (gl == null) {
        throw "unable to create gl context -- is your browser gl ready?";
      } else {
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
        gl.clearDepth(1.0); // use max when we clear the depth buffer
        gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)

      }
    } // end try

    catch(e) {
      console.log(e);
    } // end catch

} // end setupWebGL

// read triangles in, load them into webgl buffers
function loadTriangles() {
    // var inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles");
    // var inputSpheres = getJSONFile(INPUT_SPHERES_URL,"spheres");
    var xyz = [0,0,0];
    var rotate = [0,0,0];
    if (inputTriangles != String.null) {
        // for (var i = 0; i < inputTriangles.length-3; i++) {
          for (var i = 0; i < inputTriangles.length; i++) {
          var coordArray = []; // 1D array of vertex coords for WebGL
          var indexArray = []; // 1D array of vertex indices for WebGL
          var colorArray = []; // 1D array of color values for WebGL
          var colorHighlightArray = []; // 1D array of color values for WebGL
          var normalArray = [];
          var triBufferSize = 0; // the number of indices in the triangle buffer
          var vtxToAdd = []; // vtx coords to add to the coord array
          var triToAdd = vec3.create(); // tri indices to add to the index array
          var tri = inputTriangles[i];
            // set up the vertex coord array and color value array
            for (var v = 0; v < tri.vertices.length; v++) {
                vtxToAdd = tri.vertices[v];
                coordArray.push(vtxToAdd[0], vtxToAdd[1], vtxToAdd[2]);
                var colors = tri.material.diffuse;
                colorArray.push(colors[0], colors[1], colors[2], 1.0);
                colorHighlightArray.push(hDiffuse[0], hDiffuse[1], hDiffuse[2], 1.0);
            } // end for vertices in set

            // set up the vertex normal array and normal value array
            for (var n = 0; n < tri.normals.length; n++) {
                vtxToAdd = tri.normals[n];
                normalArray.push(vtxToAdd[0], vtxToAdd[1], vtxToAdd[2]);
            } // end for vertices in set

            // set up the triangle index array, adjusting indices across sets
            for (var t = 0; t < tri.triangles.length; t++) {
                indexArray.push(tri.triangles[t][0], tri.triangles[t][1], tri.triangles[t][2]);
                triBufferSize += 3;
            } // end for triangles in set

            // send the vertex coords to webGL
            var triPositionBuffer = gl.createBuffer(); // init empty vertex coord buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, triPositionBuffer); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(coordArray),gl.STATIC_DRAW); // coords to that buffer

            // send the triangle indices to webGL
            var triIndexBuffer = gl.createBuffer(); // init empty triangle index buffer
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triIndexBuffer); // activate that buffer
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indexArray),gl.STATIC_DRAW); // indices to that buffer

            // Create a buffer for the colors.
            var triColorBuffer = gl.createBuffer(); // init empty color values buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, triColorBuffer); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(colorArray),gl.STATIC_DRAW); // values to that buffer

            // Create a buffer for the highlight colors.
            var triHightlightColorBuffer = gl.createBuffer(); // init empty color values buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, triHightlightColorBuffer); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(colorHighlightArray),gl.STATIC_DRAW); // values to that buffer

            // send the triangle normals to webGL
            var triNormalBuffer = gl.createBuffer(); // init empty triangle index buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, triNormalBuffer); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(normalArray),gl.STATIC_DRAW); // indices to that buffer

            var coherence = tri.material.n;

            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers

            var newTri = new Triangle(
              i, triPositionBuffer, triIndexBuffer,
              triBufferSize, triNormalBuffer, triColorBuffer,
              triHightlightColorBuffer, AmbientR, SpecularR, coherence, false,
              mvMatrix, pMatrix, xyz, xyz, rotate, rotate);
            newTri.draw = function()
            {

              // Projection and View transforms
              mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100);
              mat4.identity(mvMatrix)
              mat4.lookAt(mvMatrix, Eye, Center, LookUp);

              // Do global transformation then the local
              var xyzTotal = new vec3.fromValues(0,0,0);
              var xyz = new vec3.fromValues(this.xyz[0], this.xyz[1], this.xyz[2]);
              var xyzLocal = new vec3.fromValues(this.xyzLocal[0],this.xyzLocal[1],this.xyzLocal[2]);
              vec3.add(xyzTotal, xyz, xyzLocal);
              mat4.translate(this.pMatrix, pMatrix, xyzTotal);
              var rotateX = this.rotate[0] + this.rotateLocal[0];
              var rotateY = this.rotate[1] + this.rotateLocal[1];
              var rotateZ = this.rotate[2] + this.rotateLocal[2];
              mat4.rotateX(this.pMatrix, this.pMatrix, rotateX);
              mat4.rotateY(this.pMatrix, this.pMatrix, rotateY);
              mat4.rotateZ(this.pMatrix, this.pMatrix, rotateZ);
              this.mvMatrix = mvMatrix;
              this.pMatrix = pMatrix;

              /* Vertex buffer: activate and feed into vertex shader */
              // set the light direction.
              gl.uniform4fv(shaderProgram.colorUniform, LightColor); // white light
              // Set the color to use
              gl.uniform3fv(shaderProgram.lightingDirectionUniform, LightLocation); // light location

              // Set default or hightlighted ambient, specular, diffuse Rs
              var amb = this.ambient;
              var spec = this.specular;
              // var diff = this.diffuse;
              if(this.highlighted){
                amb = hAmbient;
                spec = hSpecular;
                gl.uniform1i(shaderProgram.useHighlightUniform, true);
              } else{
                gl.uniform1i(shaderProgram.useHighlightUniform, false);
              }
              // console.log("color diff: "+diff);
              gl.uniform3fv(shaderProgram.ambientUniform, amb);
              gl.uniform3fv(shaderProgram.specularUniform, spec);
              // Set the specular coherence
              gl.uniform1f(shaderProgram.specularCoherenceUniform, this.coherence);

              // Position buffer
              gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
              gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
              gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

              // Bind the color buffer.
              gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
              // Tell the color attribute how to get data out of colorBuffer (ARRAY_BUFFER)
              gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

              // Bind the color buffer.
              gl.bindBuffer(gl.ARRAY_BUFFER, this.highlightBuffer);
              // Tell the color attribute how to get data out of colorBuffer (ARRAY_BUFFER)
              gl.vertexAttribPointer(shaderProgram.vertexHighlightColorAttribute, 4, gl.FLOAT, false, 0, 0);

              // Bind the normal buffer.
              gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
              gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0); // feed

              // Set the uniform vars for the projections and model-view
              gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, this.pMatrix);
              gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, this.mvMatrix);
              var normalMatrix = mat3.create();
              mat3.normalFromMat4(normalMatrix, this.mvMatrix);
              gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);

              // Finally, draw the elements.
              gl.uniform1i(shaderProgram.useTriangleUniform, true);
              gl.drawElements(gl.TRIANGLES, this.bufferSize, gl.UNSIGNED_SHORT, 0); // render
            };
            tris.push(newTri);

        } // end for each triangle set

        // console.log("coordinates: "+coordArray.toString());
        // console.log("numverts: "+vtxBufferSize);
        // console.log("indices: "+indexArray.toString());
        // console.log("numindices: "+triBufferSize);
    } // end if triangles found

    if(inputSpheres != String.null){
      // var textureCoordData = [];
      var latitudeBands = 30;
      var longitudeBands = 30;
      for(var s = 0; s < inputSpheres.length; s++){
        var sCoordArray = [];
        var sColorArray = [];
        var sColorHighlightArray = [];
        var sIndexArray = [];
        var sNormalArray = [];
        var sphereBufferSize = 0;
        var sphere = inputSpheres[s];
        var radius = sphere.r;
        var coherence = sphere.n;
        for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
          var theta = latNumber * Math.PI / latitudeBands;
          var sinTheta = Math.sin(theta);
          var cosTheta = Math.cos(theta);
          for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);
            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            // var u = 1 - (longNumber / longitudeBands);
            // var v = 1 - (latNumber / latitudeBands);
            sNormalArray.push(x);
            sNormalArray.push(y);
            sNormalArray.push(z);
            // textureCoordData.push(u);
            // textureCoordData.push(v);
            sCoordArray.push(sphere.x - radius * x);
            sCoordArray.push(sphere.y - radius * y);
            sCoordArray.push(sphere.z - radius * z);
            // console.log(JSON.stringify([radius*x, radius*y, radius*z]));
            sColorArray.push(sphere.diffuse[0], sphere.diffuse[1], sphere.diffuse[2], 1.0);
            sColorHighlightArray.push(hDiffuse[0], hDiffuse[1], hDiffuse[2], 1.0);
          }
        }

        for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
            for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
                var first = (latNumber * (longitudeBands + 1)) + longNumber;
                var second = first + longitudeBands + 1;
                sIndexArray.push(first);
                sIndexArray.push(second);
                sIndexArray.push(first + 1);
                sIndexArray.push(second);
                sIndexArray.push(second + 1);
                sIndexArray.push(first + 1);
                sphereBufferSize += 6;
            }
        }

        // Sphere vertices
        var spherePositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, spherePositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sCoordArray), gl.STATIC_DRAW);

        // Sphere indices
        var sphereIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sIndexArray), gl.STATIC_DRAW);

        var sphereColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereColorBuffer); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(sColorArray),gl.STATIC_DRAW); // values to that buffer
        // console.log(sColorArray);

        var sphereHighlightColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereHighlightColorBuffer); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(sColorHighlightArray),gl.STATIC_DRAW); // values to that buffer

        var sphereNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalBuffer); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(sNormalArray),gl.STATIC_DRAW); // values to that buffer

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
        // Projection and View transforms
        var newSphere = new Sphere(i, spherePositionBuffer, sphereIndexBuffer, sphereBufferSize, sphereNormalBuffer, sphereColorBuffer, sphereHighlightColorBuffer, AmbientR, SpecularR, coherence, false, mvMatrix, pMatrix, xyz, xyz, rotate, rotate);
        newSphere.draw = function()
        {
          // Projection and View transforms
          mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100);
          mat4.identity(mvMatrix)
          mat4.lookAt(mvMatrix, Eye, Center, LookUp);

          // Do global transformation then the local
          var xyzTotal = new vec3.fromValues(0,0,0);
          vec3.add(xyzTotal, new vec3.fromValues(this.xyz[0], this.xyz[1], this.xyz[2]), new vec3.fromValues(this.xyzLocal[0],this.xyzLocal[1],this.xyzLocal[2]));
          mat4.translate(this.pMatrix, pMatrix, xyzTotal);
          var rotateX = this.rotate[0] + this.rotateLocal[0];
          var rotateY = this.rotate[1] + this.rotateLocal[1];
          var rotateZ = this.rotate[2] + this.rotateLocal[2];
          mat4.rotateX(this.pMatrix, this.pMatrix, rotateX);
          mat4.rotateY(this.pMatrix, this.pMatrix, rotateY);
          mat4.rotateZ(this.pMatrix, this.pMatrix, rotateZ);
          this.mvMatrix = mvMatrix;
          this.pMatrix = pMatrix;

          // console.log(JSON.stringify(mvMatrix));
          /* Vertex buffer: activate and feed into vertex shader */
          // set the light direction.
          gl.uniform4fv(shaderProgram.colorUniform, LightColor); // white light
          // Set the color to use
          gl.uniform3fv(shaderProgram.lightingDirectionUniform, LightLocation); // light location

          // Set default or hightlighted ambient, specular, diffuse Rs
          var amb = this.ambient;
          var spec = this.specular;
          if(this.highlighted){
            amb = hAmbient;
            spec = hSpecular;
            gl.uniform1i(shaderProgram.useHighlightUniform, true);
          } else{
            gl.uniform1i(shaderProgram.useHighlightUniform, false);
          }
          // console.log("color diff: "+diff);
          gl.uniform3fv(shaderProgram.ambientUniform, amb);
          gl.uniform3fv(shaderProgram.specularUniform, spec);
          // Set the specular coherence
          gl.uniform1f(shaderProgram.specularCoherenceUniform, this.coherence);

          // Position buffer
          gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
          gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

          // Bind the color buffer.
          gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
          // Tell the color attribute how to get data out of colorBuffer (ARRAY_BUFFER)
          gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

          // Bind the color buffer.
          gl.bindBuffer(gl.ARRAY_BUFFER, this.highlightBuffer);
          // Tell the color attribute how to get data out of colorBuffer (ARRAY_BUFFER)
          gl.vertexAttribPointer(shaderProgram.vertexHighlightColorAttribute, 4, gl.FLOAT, false, 0, 0);

          // Bind the normal buffer.
          gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
          gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0); // feed

          // Set the uniform vars for the projections and model-view
          gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, this.pMatrix);
          gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, this.mvMatrix);
          var normalMatrix = mat3.create();
          mat3.normalFromMat4(normalMatrix, this.mvMatrix);
          gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);

          // Finally, draw the elements.
          gl.uniform1i(shaderProgram.useTriangleUniform, false);
          gl.drawElements(gl.TRIANGLES, this.bufferSize, gl.UNSIGNED_SHORT, 0); // render
        };
        spheres.push(newSphere);
      } // end spheres for
    } // end spheres found

} // end load triangles

var mvMatrix = mat4.create();
var pMatrix = mat4.create();

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    var normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, mvMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}

// setup the webGL shaders
function setupShaders() {

    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        precision mediump float;

        uniform float u_specular_coherence;

        uniform vec3 u_ambient;
        uniform vec3 u_specular;

        uniform vec4 u_color;
        uniform vec3 u_lighting_direction;

        varying vec4 v_color;
        varying vec3 v_normal;
        varying vec4 vPosition;

        void main(void) {
            // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // all fragments are white
            vec3 normal = normalize(v_normal);
            // lightNormal
            vec3 lightDirection = normalize(u_lighting_direction - vPosition.xyz);
            // eye
            vec3 eyeDirection = normalize(-vPosition.xyz);
            // R
            vec3 reflectionDirection = reflect(lightDirection, normal);
            float diffuseLightWeighting = max(dot(normal, lightDirection), 0.0);
            float specularLightWeighting =
              pow(max(dot(reflectionDirection, eyeDirection), 0.0), u_specular_coherence);
            gl_FragColor = v_color;

            // Caculate the color using Blinn-Phong shading
            gl_FragColor.rgb *=
              u_ambient +
              diffuseLightWeighting +
              specularLightWeighting * u_specular;
        }
    `;

    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 vertexPosition;
        attribute vec4 a_color;
        attribute vec4 h_color;
        attribute vec3 a_normal;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        uniform mat3 uNMatrix;

        varying vec4 v_color;
        varying vec3 v_normal;
        varying vec4 vPosition;

        uniform bool uIsTriangle;
        uniform bool uIsHighlighted;

        void main(void) {
            gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);
            // If highlighted use a different buffer from default color buffer
            if(uIsHighlighted){
              v_color = h_color;
            } else {
              v_color = a_color;
            }
            vPosition = uMVMatrix * vec4(vertexPosition, 1.0);
            if(uIsTriangle){
              v_normal = a_normal;
            } else {
              v_normal = uNMatrix * a_normal;
            }
        }
    `;

    try {
        // console.log("fragment shader: "+fShaderCode);
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        // console.log("vertex shader: "+vShaderCode);
        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution

        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);
            gl.deleteShader(vShader);
        } else { // no compile errors
            shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context
            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                shaderProgram.vertexPositionAttribute = // get pointer to vertex shader input
                    gl.getAttribLocation(shaderProgram, "vertexPosition");
                gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
                // find and enable the color attribute
                shaderProgram.vertexColorAttribute  = gl.getAttribLocation(shaderProgram, "a_color");
                gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute); // input to shader from array
                // find and enable the color attribute
                shaderProgram.vertexHighlightColorAttribute  = gl.getAttribLocation(shaderProgram, "h_color");
                gl.enableVertexAttribArray(shaderProgram.vertexHighlightColorAttribute); // input to shader from array
                // Add in the normal location to our program for lighting calculatio
                shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "a_normal");
                gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
               // Get uniform locations
                shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
                shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
                shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
                shaderProgram.colorUniform = gl.getUniformLocation(shaderProgram, "u_color");
                shaderProgram.useTriangleUniform = gl.getUniformLocation(shaderProgram, "uIsTriangle");
                shaderProgram.useHighlightUniform = gl.getUniformLocation(shaderProgram, "uIsHighlighted");
                shaderProgram.ambientUniform = gl.getUniformLocation(shaderProgram, "u_ambient");
                shaderProgram.specularUniform = gl.getUniformLocation(shaderProgram, "u_specular");
                shaderProgram.specularCoherenceUniform = gl.getUniformLocation(shaderProgram, "u_specular_coherence");
                shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "u_lighting_direction");
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders

// render the loaded model
function drawScene() {
  // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    for(var t = 0; t < tris.length; t++){
      tris[t].draw();
    }
    for(var s = 0; s < spheres.length; s++){
      spheres[s].draw();
    }
} // end drawScene()

/** These global vars will keep track of the global transformations **/
var x = 0;
var y = 0;
var z = 0;
var rotateX = 0;
var rotateY = 0;
var rotateZ = 0;
// These are for local object transformations which will be reset on unselection
var lx = 0;
var ly = 0;
var lz = 0;
var lrotateX = 0
var lrotateY = 0
var lrotateZ = 0;

function resetViewVars(){
  x = 0;
  y = 0;
  z = 0;
  rotateX = 0;
  rotateY = 0;
  rotateZ = 0;
}

// Resets the local objects' or one local object's transformation
// This can happen either because the user has deactivated the current object or
// if the backspace is hit and every sphere/tri transformation is reset
function resetLocalVars(){
  lx = 0;
  ly = 0;
  lz = 0;
  lrotateX = 0
  lrotateY = 0
  lrotateZ = 0;
}

// Sets the local var (current object's transformation info)
function fillLocalVars(xyz, rotate){
  lx = xyz[0];
  ly = xyz[1];
  lz = xyz[2];
  lrotateX = rotate[0];
  lrotateY = rotate[1];
  lrotateZ = rotate[2];
}

var currentlyPressedKeys = {};
var currentlySelectedTriangle = -1;
var currentlySelectedSphere = -1;

var triSelected = false;
var sphereSelected = false;

function handleKeyDown(event) {
   currentlyPressedKeys[event.keyCode] = true;
   handleKeys();
}

function handleKeyUp(event) {
   currentlyPressedKeys[event.keyCode] = false;
}

function resetTris(){
  if(currentlySelectedTriangle != -1){
    tris[currentlySelectedTriangle].setHighlighted(false);
  }
}

function resetSpheres(){
  if(currentlySelectedSphere != -1){
    spheres[currentlySelectedSphere].setHighlighted(false);
  }
}

function handleKeys() {
  var resetView = false;
  var unselect = false;
  // Left and Right to hightlight/select the next tri; we'll start with first
  // tri and go in order
  // Press Right
  if (event.keyCode == 39) {
    if(currentlySelectedTriangle == -1){
      currentlySelectedTriangle = 0;
    } else if(currentlySelectedTriangle < tris.length - 1){
      resetTris();
      currentlySelectedTriangle++;
    } else {
      resetTris();
      currentlySelectedTriangle = 0;
    }
    triSelected = true;
    sphereSelected = false;
  }
  // Press Left
  if (event.keyCode == 37) {
    if(currentlySelectedTriangle == -1){
      currentlySelectedTriangle = tris.length - 1;
    } else if(currentlySelectedTriangle > 0){
      resetTris();
      currentlySelectedTriangle--;
    } else {
      resetTris();
      currentlySelectedTriangle = tris.length - 1;
    }
    triSelected = true;
    sphereSelected = false;
  }

  // Up and Down to hightlight/select the next sphere; we'll go clockwise
  if (event.keyCode == 38) { // Up
    if(currentlySelectedSphere == -1){
      currentlySelectedSphere = 0;
    } else if(currentlySelectedSphere < spheres.length - 1){
      resetSpheres();
      currentlySelectedSphere++;
    } else {
      resetSpheres();
      currentlySelectedSphere = 0;
    }
    sphereSelected = true;
    triSelected = false;
  }

  if (event.keyCode == 40) { // Down
    if(currentlySelectedSphere == -1){
      currentlySelectedSphere = spheres.length - 1;
    } else if(currentlySelectedSphere > 0){
      resetSpheres();
      currentlySelectedSphere--;
    } else {
      resetSpheres();
      currentlySelectedSphere = spheres.length - 1;
    }
    sphereSelected = true;
    triSelected = false;
  }

  // Space to deselect and turn off highlight
  if (event.keyCode == 32) {
    sphereSelected = false;
    triSelected = false;
    unselect = true;
    // resetLocalVars();
    resetTris();
    resetSpheres();
  }

  // Reset on ESC
  if (event.keyCode == 27) {
    resetView = true;
  }

  var object;
  // Backspace
  if(event.keyCode == 8){
    // resetLocalVars();
    sphereSelected = false;
    triSelected = false;
    for(var t = 0; t < tris.length; t++){
      object = tris[t];
      object.setXYZLocal(0, 0, 0);
      object.setRotateLocal(0, 0, 0);
      object.setHighlighted(false);
    }
    for(var s = 0; s < spheres.length; s++){
      object = spheres[s];
      object.setXYZLocal(0, 0, 0);
      object.setRotateLocal(0, 0, 0);
      object.setHighlighted(false);
    }
  }

  /** DEFAULT BEHAVIOR (no selection) **/
  if(!triSelected && !sphereSelected){
    if (String.fromCharCode(event.keyCode) == "W" && !event.shiftKey) {
       // Back along z
      z += 0.05;
    } else if(String.fromCharCode(event.keyCode) == "W" && event.shiftKey){
      // Rotate forward on x
      rotateX += Math.PI / 12;
    }
    if (String.fromCharCode(event.keyCode) == "S" && !event.shiftKey) {
      // Forward along x
      z -= 0.05;
    } else if(String.fromCharCode(event.keyCode) == "S" && event.shiftKey){
      // Rotate backward on x
      rotateX -= Math.PI / 12;
    }

    if (String.fromCharCode(event.keyCode) == "A" && !event.shiftKey) {
      // Left along x
      x += 0.05;
    }  else if(String.fromCharCode(event.keyCode) == "A" && event.shiftKey){
      // Rotate left along y
      rotateY += Math.PI / 12;
    }
    if (String.fromCharCode(event.keyCode) == "D" && !event.shiftKey) {
      // Right along x
      x -= 0.05;
    }  else if(String.fromCharCode(event.keyCode) == "D" && event.shiftKey){
      // Rotate right along y
      rotateY -= Math.PI / 12;
    }

    if (String.fromCharCode(event.keyCode) == "Q" && !event.shiftKey) {
      // Left along
      y -= 0.05;
    }   else if(String.fromCharCode(event.keyCode) == "Q" && event.shiftKey){
      // Rotate view CC on z
      rotateZ += Math.PI / 12;
    }
    if (String.fromCharCode(event.keyCode) == "E" && !event.shiftKey) {
      // Right view C on z
      y += 0.05;
    }  else if(String.fromCharCode(event.keyCode) == "E" && event.shiftKey){
      rotateZ -= Math.PI / 12;
    }
  } else {/** Selected object behavior **/

    if(triSelected){
      resetSpheres();
      object = tris[currentlySelectedTriangle];
      object.setHighlighted(true);
    } else {
      resetTris();
      object = spheres[currentlySelectedSphere];
      object.setHighlighted(true);
    }
    fillLocalVars(object.xyzLocal, object.rotateLocal);

    // Transformations
    if (String.fromCharCode(event.keyCode) == "K" && !event.shiftKey) {
      // Left along x
      lx += 0.05;
    } else if(String.fromCharCode(event.keyCode) == "K" && event.shiftKey){
      // Rotate forward on y
      lrotateY += Math.PI / 12;
    }
    // char ;
    if (event.keyCode == 186 && !event.shiftKey) {
      // Right along x
      lx -= 0.05;
    } else if(event.keyCode == 186 && event.shiftKey){
      // Rotate backward on y
      lrotateY -= Math.PI / 12;
    }

    if (String.fromCharCode(event.keyCode) == "O" && !event.shiftKey) {
      // Left along x
      lz += 0.05;
    }  else if(String.fromCharCode(event.keyCode) == "O" && event.shiftKey){
      // Rotate left along y
      lrotateX += Math.PI / 12;
    }
    if (String.fromCharCode(event.keyCode) == "L" && !event.shiftKey) {
      // Right along x
      lz -= 0.05;
    }  else if(String.fromCharCode(event.keyCode) == "L" && event.shiftKey){
      // Rotate right along y
      lrotateX -= Math.PI / 12;
    }

    if (String.fromCharCode(event.keyCode) == "I" && !event.shiftKey) {
      // Left along
      ly -= 0.05;
    }   else if(String.fromCharCode(event.keyCode) == "I" && event.shiftKey){
      // Rotate view CC on z
      lrotateZ += Math.PI / 12;
    }
    if (String.fromCharCode(event.keyCode) == "P" && !event.shiftKey) {
      // Right view C on z
      ly += 0.05;
    }  else if(String.fromCharCode(event.keyCode) == "P" && event.shiftKey){
      lrotateZ -= Math.PI / 12;
    }
  }

  // Determine whether to make local draws or global
  if(triSelected || sphereSelected){ // local transform
    object.setXYZLocal(lx, ly, lz);
    object.setRotateLocal(lrotateX, lrotateY, lrotateZ);
  } else if(!unselect) { // global transform
    if(resetView){
      // Reset global transform values
      resetViewVars();
    }
    // Else follow through with the global transform
    for(var t = 0; t < tris.length; t++){
      tris[t].setXYZ(x, y, z);
      tris[t].setRotate(rotateX, rotateY, rotateZ);
    }
    for(var s = 0; s < spheres.length; s++){
      spheres[s].setXYZ(x, y, z);
      spheres[s].setRotate(rotateX, rotateY, rotateZ);
    }
  }
  drawScene();
}

// EXTRA CREDIT: RESIZE VIEWPORT
function resizeCanvas() {
  var c = document.getElementById("myWebGLCanvas");
  var newH = document.getElementById("height").value;
  var newW = document.getElementById("width").value;
  if(parseInt(newH, 10) > 1 && parseInt(newW, 10) > 1){
    c.height = newH;
    c.width = newW;
    drawScene();
  } else {
    alert("Please enter a valid height and width value!");
  }
}

window.onkeydown = function(e) {
  return !(e.keyCode == 32 || e.keyCode == 38 || e.keyCode == 40 && e.target == document.body);
};

/* MAIN -- HERE is where execution begins after window load */
function main() {
  setupWebGL(); // set up the webGL environment
  setupShaders(); // setup the webGL shaders (attribs)
  loadTriangles(); // load in the triangles from tri file (buffers)
  drawScene(); // draw the triangles using webGL
  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;
} // end main
