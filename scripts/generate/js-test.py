from os.path import join, relpath
import os
import subprocess
import util

os.environ['DJANGO_SETTINGS_MODULE'] = 'django_settings'
from django.template.loader import render_to_string

config = util.get_config()

def generate_deps():
  """Generate deps.js"""
  calc_deps = join(config.CLOSURE_LIBRARY, 'closure', 'bin', 'calcdeps.py')

  subprocess.check_call(
      ['python', calc_deps, 
       '--dep={0}'.format(config.CLOSURE_LIBRARY),
       '--path={0}'.format(config.JS_PATH),
       '--output_mode=deps',
       '--output_file={0}'.format(join(config.JS_TEST_PATH, 'deps.js'))])

def generate_alltests():
  """Generate alltests.js"""
  tests = []
  for dirpath,dirname,filenames in os.walk(config.JS_TEST_PATH):
    for filename in filenames:
      if filename.endswith('_test.html'):
        file = join(dirpath, filename)
        file = relpath(file, config.JS_TEST_PATH)
        tests.append(file)

  rendered = render_to_string('alltests.js', { 'tests': tests })
  path = join(config.JS_TEST_PATH, 'alltests.js')
  util.write_file(rendered, path, remove_blank_lines=True)

