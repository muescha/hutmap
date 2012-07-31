from django.test import TestCase
import json

class HutResourceTestCase(TestCase):
  fixtures = ['test_data.json']

  def test_query_bbox(self):
    response = self.client.get('/huts/api/v1/hut/?bbox=47.05814,-122.79683,49.05814,-120.79683')
    results = json.loads(response.content)
    self.assertEqual(7, results['meta']['total_count'])

  def test_query_bbox_across_180th_meridian(self):
    response = self.client.get('/huts/api/v1/hut/?bbox=44.302615,145.859282,74.411905,-103.398531')
    results = json.loads(response.content)
    self.assertEqual(28, results['meta']['total_count'])
