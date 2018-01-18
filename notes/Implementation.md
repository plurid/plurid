<link rel="stylesheet" type="text/css" href="style.css">


# Implementation


### `git commit` sufixes

+ Dev :: initial development;
+ Feat :: feature polishing;
+ Refact :: refactoring;
+ Fix :: bugs and their fixes;
+ Note :: clarification, documentation;
+ Setup :: system enclosure;
+ Test :: testing;


## TODOs

+ Toggle `<plurid-options>` between `display: none;` and `display: block;` by calculating the position of the cursor with respect to the bottom;



## Bugs

+ Issue when rotating around X from 90 degrees to 270 degrees having to do with the matrix3d calculations, matrix decomposition.

Rotate X 1.5400017599169171
Rotate X in Degrees 88.23560128595841
Rotate Y 0.8726641164790192
Rotate Y in Degrees 49.99997080676067

Rotate X 1.6100017695867632
Rotate X in Degrees 92.24630640591556
Rotate Y 5.4105211907005675
Rotate Y in Degrees 310.00002919323936

Rotate X 1.680002261230098
Rotate X in Degrees 96.25703914091943
Rotate Y 0.8726641164790192
Rotate Y in Degrees 49.99997080676067


The issue appears when rotate X/Y is non-zero


possible issue with the sign of matrix3d[1] and matrix3d[8]



Rotate Y 6.108653804331896
Rotate Y in Degrees 350.00008149475184
matrix3d(0.984808, 0.164875, 0.0544925, 0, 0, -0.313812, 0.949485, 0, 0.173647, -0.93506, -0.309045, 0, 10, 10, 0, 1)

Rotate Y 0.1745315028476902
Rotate Y in Degrees 9.99991850524815
matrix3d(0.984808, -0.16066, -0.0658908, 0, 0, -0.379453, 0.925211, 0, -0.173647, -0.911155, -0.373689, 0, 10, 10, 0, 1)
