FROM python:3.9.7-buster
ENV PATH /usr/local/bin:$PATH

# RUN echo "deb http://ftp.debian.org/debian stretch-backports main"  > /etc/apt/sources.list.d/backports.list
RUN apt-get update && apt-get install -y unzip build-essential wget git htop jq parallel curl lsb-release apt-transport-https software-properties-common 

# This will be needed for commiting static files to git
RUN wget -c https://github.com/cli/cli/releases/download/v1.5.0/gh_1.5.0_linux_amd64.deb  && dpkg -i gh_1.5.0_linux_amd64.deb && rm gh_1.5.0_linux_amd64.deb

# Install npm
RUN (curl -sL https://deb.nodesource.com/setup_16.x | bash - ) && apt-get install -y nodejs

# Install github
RUN wget -c https://github.com/cli/cli/releases/download/v1.5.0/gh_1.5.0_linux_amd64.deb  && dpkg -i gh_1.5.0_linux_amd64.deb && rm gh_1.5.0_linux_amd64.deb
# Install terraform
RUN curl -fsSL https://apt.releases.hashicorp.com/gpg | apt-key add -
RUN apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main" && apt-get update &&  apt-get install terraform && terraform -install-autocomplete
# Install aws
RUN cd /tmp && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip && ./aws/install && rm -rf ./aws

ADD .devcontainer /.devcontainer
RUN pip install -r /.devcontainer/requirements.dev.txt
RUN /.devcontainer/install.sh