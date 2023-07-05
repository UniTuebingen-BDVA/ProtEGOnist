# Given: 
#   - All Nodes: a List of nodes
#   - Subset Nodses: a List of nodes that are a subset of the first list
#   - target direction: a direction in degrees
#   - center: a point in the plane
#   - radius: a number
# Return:
#   - pos: a dictionary of positions for each node
# layout 'All Nodes' in a circle with the same distance between each node and the next
# Arrange all nodes in circle, with the subset of the nodes should be placed in the target direction

import math
import numpy as np

def customCircleLayout(nonSubsetNode, subsetNodes, targetDirection, center, radius, reverse=False):
    print("customCircleLayout2")
    pos = {}
    allNodes = nonSubsetNode + subsetNodes
    print(allNodes)
    # Calculate the angle between each node
    angle_step = 360 / len(allNodes)
    # Calculate the angle covered by the subset of nodes
    subsetAngle = len(subsetNodes) * angle_step
    # Get index in the circular raster that is closes to the target direction
    targetIndex = int(round(targetDirection / angle_step))
    # Arrange the subset of Nodes such that they are in a circle with angle_step between each node
    # if the number of subsetNodes is odd, the targetIndex is the middle of the subset otherwise the targetIndex is the middle of the subset - 1
    if len(subsetNodes) % 2 == 0:
        idx = targetIndex - (len(subsetNodes) / 2) - 1
    else:
        idx = targetIndex - (len(subsetNodes) / 2)
    # Arrange the subset of nodes in a circle
    for i in range(len(subsetNodes)):
        if reverse:
            pos[subsetNodes[len(subsetNodes)-1-i]] = [center[0] + radius * math.cos(math.radians(idx * angle_step)), center[1] + radius * math.sin(math.radians(idx * angle_step))]

        else:    
            pos[subsetNodes[i]] = [center[0] + radius * math.cos(math.radians(idx * angle_step)), center[1] + radius * math.sin(math.radians(idx * angle_step))]
        idx += 1
         
    # fill the remaining nodes in the circle

    for i in range(len(nonSubsetNode)):
        pos[nonSubsetNode[i]] = [center[0] + radius * math.cos(math.radians(idx * angle_step)), center[1] + radius * math.sin(math.radians(idx * angle_step))]
        idx += 1

    return pos
  



