__BASE_IMAGE__

RUN cd /www
	
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

ENTRYPOINT /www/__DOCKER_UTIL_DIR__/test/run.sh
