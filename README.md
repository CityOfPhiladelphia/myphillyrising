myPhillyRising
==============

A mobile web app to support the outreach work of the PhillyRising collaborative. 
 
[OpenPlans](http://openplans.org) is currently building a webapp for the City of Philadelphia's Managing Director's office, working closely with the PhillyRising team. 

Stay tuned for more about the tool. It's in a very early state of development - feel free to poke around in our source code!


Setup Instructions
------------------

Install `pip` and `virtualenv`, if not already installed.  These will keep your
python code isolated from the rest of your machine and ensure you have
the correct versions.

    easy_install pip
    pip install virtualenv

You may need to use `sudo` to install these tools.

    sudo easy_install pip
    sudo pip install virtualenv

Clone the repo:

    git clone https://github.com/openplans/myphillyrising.git

Create a new virtual environment inside of the repository folder, and install
the project requirements:

    virtualenv env
    source env/bin/activate
    pip install -r requirements.txt

Do the usual:

    pip install -r requirements.txt
    ./manage.py syncdb
    ./manage.py migrate
    cp local_settings.py.template local_settings.py
    cd website

Do the *bower* install in both the `myphillyrising` and `alexander` folders:

    cd myphillyrising/static
    bower install
    cd ../..
    cd alexander/static
    bower install
    cd ../..

Load the neighborhoods and tags:

    ./manage.py loaddata fixtures/phillyrising_neighborhoods.json

Load some content items:

    ./manage.py runserver  # Run this in one terminal
    ./manage.py celeryd    # Run this in another terminal

Browse to `http://localhost:8000/admin` and add a feed or two. Click the *Refresh* button next to each feed to import the data. Give it a minute (you should see database activity scrolling by in your `celeryd` terminal as the content items are loading).


About PhillyRising
------------------
PhillyRising targets neighborhoods throughout Philadelphia that are plagued by chronic crime and quality of life concerns, and establishes partnerships with community members to address these issues. The PhillyRising Team coordinates the actions of City agencies to help neighbors realize their vision for their community through sustainable, responsive, and cost-effective solutions. Read more at [phila.gov/phillyrising](http://www.phila.gov/phillyrising/).
