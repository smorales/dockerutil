FROM composer AS composer

COPY ./ /app

RUN cd /app

RUN composer install \
  --optimize-autoloader \
  --no-dev \
  --no-interaction \
  --classmap-authoritative \
  --no-progress

#
# ------------------------------------------------------------------------
#

__BASE_IMAGE__

EXPOSE 80
EXPOSE 443

ENV ARTISAN_MIGRATE="1" \
    ARTISAN_OPTIMIZE="1"

COPY --chown=www-data:www-data --from=composer /app /www

RUN find /www -type d -exec chmod -R 555 {} \; \
    && find /www -type f -exec chmod -R 444 {} \; \
    && find /www/storage /www/bootstrap/cache -type d -exec chmod -R 755 {} \; \
    && find /www/storage /www/bootstrap/cache -type f -exec chmod -R 644 {} \; \
    && find /www/storage/logs -type d -exec chmod -R 777 {} \;