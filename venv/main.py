from flask import Flask, session
from flask_socketio import SocketIO
from application import create_app
from application.user_database import user_Db
from application.message_database import message_Db
from waitress import serve
import time
import os
from OpenSSL import SSL, crypto
import eventlet
import subprocess


# SETUP
app = create_app()
socketio = SocketIO(app)

# Communication Functions


@socketio.on('receive_message')
def handle_my_custom_event(json, methods=['GET', 'POST']):

    data = dict(json)
    data['chat_room'] = data['chat_room'].lower()
    if "sender" in data:
        message_database = message_Db()
        message_database.save_message(data["sender"], data["content"], data["chat_room"])
        print(json)

    socketio.emit('message response', json)

# MAINLINE

def create_self_signed_cert(certfile, keyfile, certargs, cert_dir=".", nginx_dir="./conf"):
    C_F = os.path.join(cert_dir, certfile)
    C_F2 = os.path.join(nginx_dir, certfile)
    K_F = os.path.join(cert_dir, keyfile)
    K_F2 = os.path.join(nginx_dir, keyfile)
    if not os.path.exists(C_F) or not os.path.exists(K_F):
        k = crypto.PKey()
        k.generate_key(crypto.TYPE_RSA, 2048)
        cert = crypto.X509()
        cert.get_subject().C = certargs["Country"]
        cert.get_subject().ST = certargs["State"]
        cert.get_subject().L = certargs["City"]
        cert.get_subject().O = certargs["Organization"]
        cert.get_subject().OU = certargs["Org. Unit"]
        cert.get_subject().CN = 'Example'
        cert.set_serial_number(1000)
        cert.gmtime_adj_notBefore(0)
        cert.gmtime_adj_notAfter(315360000)
        cert.set_issuer(cert.get_subject())
        cert.set_pubkey(k)
        cert.sign(k, 'sha1')
        open(C_F, "wb").write(crypto.dump_certificate(crypto.FILETYPE_PEM, cert))
        open(C_F2, "wb").write(crypto.dump_certificate(crypto.FILETYPE_PEM, cert))
        open(K_F, "wb").write(crypto.dump_privatekey(crypto.FILETYPE_PEM, k))
        open(K_F2, "wb").write(crypto.dump_privatekey(crypto.FILETYPE_PEM, k))

CERT_FILE = "cert.pem"
KEY_FILE = "key.pem"



if __name__ == "__main__":
    create_self_signed_cert(CERT_FILE, KEY_FILE,
                            certargs=
                            {"Country": "AA",
                             "State": "AA",
                             "City": "ABCD",
                             "Organization": "ABCD",
                             "Org. Unit": "ABCD"})
    nginx_result = os.system("start ./nginx.exe")
    socketio.run(app, debug=True, host='127.0.0.1', keyfile=KEY_FILE, certfile=CERT_FILE, port=5000)
    #serve(app, host='127.0.0.1', port=5000, url_scheme="https")



