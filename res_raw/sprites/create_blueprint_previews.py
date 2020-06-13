# Requirements: numpy, scipy, Pillow,
from __future__ import print_function
import sys
import numpy as np
from scipy import ndimage
from PIL import Image, ImageFilter, ImageChops
import math
from os import listdir
from os.path import isdir, isfile

roberts_cross_v = np.array([[0, 0, 0],
                            [0, 1, 0],
                            [0, 0, -1]])

roberts_cross_h = np.array([[0, 0, 0],
                            [0, 0, 1],
                            [0, -1, 0]])


def rgb2gray(rgb):
    return np.dot(rgb[..., :3], [0.2989, 0.5870, 0.1140])


def save_image(data, outfilename, src_image):
    img = Image.fromarray(np.asarray(
        np.clip(data, 0, 255), dtype="uint8"), "L")
    dest = Image.new("RGBA", (img.width, img.height))
    src = img.load()
    dst = dest.load()

    realSrc = src_image.load()
    mask = src_image.filter(ImageFilter.GaussianBlur(10)).load()
    orig = src_image.load()

    for x in range(img.width):
        for y in range(img.height):
            realpixl = realSrc[x, y]
            greyval = float(src[x, y])
            greyval = min(255.0, greyval)
            greyval = math.pow(
                min(1, float(greyval / 255.0 * 1)), 1.5) * 255.0 * 1
            greyval = max(0, greyval)
            alpha = mask[x, y][3] / 255.0 * 1

            edgeFactor = src[x, y] / 255.0
            noEdge = 1 - edgeFactor

            shadow = min(1, 1 - realpixl[3] / 255.0 - edgeFactor)
            noShadow = 1 - shadow

            dst[x, y] = (
                min(255, int((realpixl[0] / 255.0 * 0.4 + 0.6) * 104 * 1.1)),
                min(255, int((realpixl[1] / 255.0 * 0.4 + 0.6) * 200 * 1.1)),
                min(255, int((realpixl[2] / 255.0 * 0.4 + 0.6) * 255 * 1.1)),
                min(255, int(float(realpixl[3]) * (0.6 + 5 * edgeFactor))))


    dest.save(outfilename)


def roberts_cross(infilename, outfilename):
    print("Processing", infilename)
    img = Image.open(infilename)
    img.load()
    img = img.filter(ImageFilter.GaussianBlur(0.5))

    image = rgb2gray(np.asarray(img, dtype="int32"))
    vertical = ndimage.convolve(image, roberts_cross_v)
    horizontal = ndimage.convolve(image, roberts_cross_h)
    output_image = np.sqrt(np.square(horizontal) + np.square(vertical))
    save_image(output_image, outfilename, img)


def generateUiPreview(srcPath, buildingId):
    print(srcPath, buildingId)
    img = Image.open(srcPath)
    img.load()
    img.thumbnail((110, 110), Image.ANTIALIAS)
    img.save("../res/ui/hud/building_previews/" + buildingId + ".png")

    img = img.convert("LA")

    data = img.load()
    for x in range(img.width):
        for y in range(img.height):
            data[x, y] = (data[x, y][0], int(data[x, y][1] * 0.5))

    img.save("../res/ui/hud/building_previews/" + buildingId + "_disabled.png")


buildings = listdir("buildings")

for buildingId in buildings:
    if "hub" in buildingId:
        continue
    roberts_cross("buildings/" + buildingId + "", "blueprints/" + buildingId + "")
