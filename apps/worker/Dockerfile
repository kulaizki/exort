FROM python:3.12-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends stockfish && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ src/

ENV STOCKFISH_PATH=/usr/games/stockfish
ENV PYTHONUNBUFFERED=1

HEALTHCHECK --interval=30s --timeout=5s CMD python -c "print('ok')"

CMD ["python", "-m", "src.worker"]
