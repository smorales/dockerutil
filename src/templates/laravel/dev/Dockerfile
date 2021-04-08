__BASE_IMAGE__

#RUN mkdir /www
RUN cd /www
	
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

#RUN rm -rf /etc/nginx/sites-enabled/*
#COPY /docker/dev/nginx/sites-enabled/ /etc/nginx/sites-enabled/
#COPY /docker/dev/nginx/certs/ /etc/nginx/certs/

EXPOSE 80
EXPOSE 443

ENV ARTISAN_MIGRATE="__RUN_MIGRATE_ON_STARTUP__" \
    ARTISAN_OPTIMIZE="0"


#RUN find /www -type d -exec chmod -R 555 {} \; \
#    && find /www -type f -exec chmod -R 444 {} \; \
#    && find /www/wsfiles /www/storage /www/bootstrap/cache -type d -exec chmod -R 755 {} \; \
#    && find /www/wsfiles /www/storage /www/bootstrap/cache -type f -exec chmod -R 644 {} \; \
#    && find /www/storage/logs -type d -exec chmod -R 777 {}; 