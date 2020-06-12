from __future__ import print_function
import os

"""

	@author: Thomas Theis
	June 2020
	GNU General Public License v3.0

"""
os.system("free-tex-packer-cli --project .\shapez_size_100.ftpp")
os.system("free-tex-packer-cli --project .\shapez_size_75.ftpp")
os.system("free-tex-packer-cli --project .\shapez_size_50.ftpp")
os.system("free-tex-packer-cli --project .\shapez_size_25.ftpp")
os.system("free-tex-packer-cli --project .\shapez_size_10.ftpp")



def update_file( filename, match , replacement ):
	"""

		Update Line in file, were match.

	"""

	# Read File
	with open(filename, 'r') as file:
		# Read list of lines into a list object
		data = list(file.readlines())
		
	# Loop through lines in file backwards, (meta: I know the keyword is at the bottem of the file.)
	for i in range(len(data) -1, 0, -1):

			# Check for Match
			if match in data[i]:
			
				# Print data before updated.
				print("\n\nUpdated the line:")
				print(data[i])
				print("New line:")
				
			
				# Update data
				data[i] = replacement
				
				# Print New data
				print(data[i],"\n\n")
				
				# Break loop
				break
				

	# ReOpen file to write
	with open(filename, 'w') as file:

		# Write modified data.
		file.writelines( data )
		

update_file("../res_built/atlas/atlas0_100.json", "image", '    "image": "atlas0_100.png",\n')
update_file("../res_built/atlas/atlas0_75.json", "image", '    "image": "atlas0_75.png",\n')
update_file("../res_built/atlas/atlas0_50.json", "image", '    "image": "atlas0_50.png",\n')
update_file("../res_built/atlas/atlas0_25.json", "image", '    "image": "atlas0_25.png",\n')
update_file("../res_built/atlas/atlas0_10.json", "image", '    "image": "atlas0_10.png",\n')
