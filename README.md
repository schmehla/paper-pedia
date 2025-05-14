# paper-pedia

A lightweight wrapper for wikipedia written in Python and Go (and plain JS) optimized for e-book readers. These optimizations include:
- replacing continuous scrolling with discrete pages (swipe or use `<`/`>` buttons)
- a button controlled zoom setting
- a simple search function

Disclaimer: Probably **!! not secure !!** As much stuff is pulled from wikipedia and injected into the page! Written in a day :)

## Article Reader

![localhost_8080_wiki_Wikipedia](https://github.com/user-attachments/assets/1a8c5aa3-857c-454e-8834-b32f5696b0cc)

## Search Page

![localhost_8080_search_q=wikipedia](https://github.com/user-attachments/assets/a496c00b-02c1-45e3-aa60-ff87e974d73b)

# Deployment
- run either the `backend.py` in a venv (requirements provided, not dockerized yet)
- or run the `backend.go` (on parity, no dependencies):
    - as a systemd service (in `/etc/systemd/system/paper-pedia.service`):
    - ```ini
      [Unit]
      Description=paper-pedia
      After=network.target
      
      [Service]
      ExecStart=<your path>/paper-pedia
      Restart=always
      RestartSec=5
      ```
