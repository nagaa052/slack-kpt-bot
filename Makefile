NAME := slack-kpt-bot

DOCKER_BUILD := docker build
DOCKER_RUN := docker run


build:
	$(DOCKER_BUILD) -t $(NAME) .

run:
	$(DOCKER_RUN)  --rm -e SLACK_BOT_TOKEN=$(KPT_SLACK_BOT_TOKEN) -e SLACK_TEAM=$(KPT_SLACK_TEAM) $(NAME)

.PHONY: build run
