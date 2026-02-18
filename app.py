from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/order-pickles')
def order_page():
    return render_template('order.html')

@app.route('/summary')
@app.route('/summary.html')
def summary_page():
    return render_template('summary.html')

@app.route('/images/<path:filename>')
def serve_images(filename):
    return send_from_directory('static/images', filename)

if __name__ == '__main__':
    app.run(debug=True)
