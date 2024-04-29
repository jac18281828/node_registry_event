FROM jac18281828/tsdev:latest

COPY --chown=jac:jac . .

USER jac
