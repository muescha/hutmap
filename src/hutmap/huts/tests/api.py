from huts.management.commands.mysqldistfn import add_distance_fn
from tastypie.test import ResourceTestCase

def float_equals(a, b):
  return abs(a - b) < 0.00001

class HutResourceTestCase(ResourceTestCase):
  fixtures = ['test_data.json']
  url = '/huts/api/v1/hut/'

  @classmethod
  def setUpClass(cls):
    add_distance_fn()

  def test_query_bbox(self):
    response = self.client.get(self.url, data={'bbox':  '47.05814,-122.79683,49.05814,-120.79683'})
    results = self.deserialize(response)
    self.assertEqual(10, results['meta']['total_count'])

  def test_query_bbox_across_180th_meridian(self):
    response = self.client.get(self.url, data={'bbox': '44.302615,145.859282,74.411905,-103.398531'})
    results = self.deserialize(response)
    self.assertEqual(29, results['meta']['total_count'])

  def test_query_id_in(self):
    response = self.client.get(self.url, data={'id__in': '3,4'})
    results = self.deserialize(response)
    self.assertEqual(2, results['meta']['total_count'])

  def test_query_id_not_in(self):
    response = self.client.get(self.url, data={'!id__in': '3,4'})
    results = self.deserialize(response)
    self.assertEqual(48, results['meta']['total_count'])

  def test_dehydrate_location(self):
    response = self.client.get(self.url, data={'id': '2'})
    results = self.deserialize(response)
    hut = results['objects'][0]
    location = hut['location']
    self.assertTrue(float_equals(38.9635, location['lat']))
    self.assertTrue(float_equals(-107.03731, location['lng']))

  def test_order_by_distance(self):
    response = self.client.get(self.url, data={
      'order_by_distance': '48.25055,-120.0022', 
      'limit': '3'
    })
    results = self.deserialize(response)
    huts = results['objects']
    self.assertEqual("Leecher Mountain Lookout", huts[0]['name'])
    self.assertEqual("Lookout Mountain Lookout", huts[1]['name'])
    self.assertEqual("North Twentymile Lookout", huts[2]['name'])

  def test_combined_query(self):
    response = self.client.get(self.url, data={
      'bbox': '47.05814,-122.79683,49.05814,-120.79683',
      '!id__in': '34,36,37'
    })
    results = self.deserialize(response)
    self.assertEqual(10, results['meta']['total_count'])

