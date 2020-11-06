# Final Project Proposal

**Project URL**: TODO

##➝ Project Abstract
This project will be an interactive application in tandem with NASA JPL that aids scientists from the Mars 2020 Rover’s Planetary Instrument for X-Ray Lithochemistry (PIXL) team in analyzing astrobiological data. There exists a significant amount of data from the Mars 2020 project that is being used to explore the possibility of alien biosignatures. Researchers need an intuitive way to compare data including mineral concentrations, spatially located X-Ray samples, and ordinal channel comparisons.

To summarize, the proposed problem that my team wishes to address is the lack of tooling available to efficiently analyze Mars Rover PIXL data in order to reach conclusions about the mineral composition of Mars. 

Members of the NASA team have already expressed interest in having visualizations, so our solution would be to work closely with them to create a specialized interactive application that supports their data analysis needs in ways that wouldn’t be possible using their existing tools.

##➝ The Data
The PIXL instrument provides a magnitude of information, such as: 
A number of images captured as the instrument passes over the sampling area.
Spatially localized x-ray spectra with 1024 ordinal channels, each with a count of x-rays sensed by the detector at that particular channel.
The x-ray energy histograms will reflect the chemistry of the element in the sample, and from this we should be able distinguish the different elements that are present in a given histogram.

##➝ User Group
The user group of the application is the NASA JPL Mars 2020 PIXL instrument team. Due to the nature of the project, the team consists of a variety of roles including sedimentologists, igneous petrologists, spectroscopists, and geochemists. Having direct access to our potential users will allow us to co-create visualization tools with them. We will be working closely with David Flannery, one of the Co-Investigators of the astrobiology segment of the team and whose availability is best suited for our project timeline. We would also be working in tandem with Scott Davidoff, the manager of NASA JPL’s Human Interfaces Group. One of our team members has worked closely with Scott in the past, and Scott has been our primary point of contact thus far. Another possible collaborator will be Austin Wright of the Polo Lab at Georgia Tech, who is exploring machine learning comparisons of the different mineral profiles.

We understand that collaborating with others adds a communication overhead, so our plan is to establish a regular meeting with the two primary stakeholders, Scott and David. If possible, we would ideally dedicate the first half of the meeting to general topics and feedback, while we spend the second half of the meeting with just David, doing a deep dive into the usability of the visualizations and performing user studies with him as needed.

##➝ Goals
To create an interactive application that can visualize data sent by the Mars 2020 PIXL instrument in order to aid in bio-signature detection. To accomplish this, data from the Rover can be visualized to allow for easier and more efficient analysis. 

One way in which we might do this is to use visualizations to show the different element weight percentages given x-ray data. Another feature could be to use those percentages to suggest which minerals those possibly imply and how they were formed. 

Some possible challenges will be to succinctly summarize the data while also displaying error and uncertainty, to create a hyper-specialized application made for experts, and to create an intuitive user experience and clear user interface while fully supporting user intent and control.

##➝ Interactivity
Some possible ways in which our application could support interactivity are:
Allowing the user to select which data points to analyze or summarize.
Allowing the users to clean the data.
Different levels of granularity when performing analysis.
Allowing the user to compare different data points.
Showing the user many different visualization formats at first glance while supporting deep dives into more specific visualizations.
Built-in statistical analysis of data such as mean, variance, and significance testing.
Providing features that support simple machine learning methods such as regression and classification.
Multi-user collaboration such as sharing visualizations, commenting on visualizations, and more.
Being able to compare a sample to spatially nearby samples.
An image viewer for the image data that the instrument collects.
These are just suggestions, but after meeting with the stakeholders we will work with them to scope the project and make a prioritized list of features to address.

##➝ Resources
To learn more about the NASA project, see PIXL for Scientists.
