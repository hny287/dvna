# Damn Vulnerable NodeJS Application

FROM node:carbon
LABEL MAINTAINER "Subash SN"

WORKDIR /app

COPY . .

RUN chmod +x /app/entrypoint.sh \
	&& npm install

USER node

CMD ["bash", "/app/entrypoint.sh"]