"""Blender background-mode generator. A metric greybox, NOT final game art.
Run: blender --background --python tools/build-gatherer-blockout.py
Only regenerates its own v2 files; never opens or overwrites another .blend.
"""
from pathlib import Path
import json
import math
import sys
import bpy
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

ROOT = Path(__file__).resolve().parents[1]
NEAR = '--near' in sys.argv
VERSION = 'gatherer-near-v3' if NEAR else 'gatherer-blockout-v2'
OUT = ROOT / 'art-source/knight-rush-backgrounds' / VERSION
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1
scene.render.engine = 'CYCLES'
scene.cycles.samples = 24
scene.cycles.use_denoising = True
scene.render.resolution_x = 960
scene.render.resolution_y = 1024
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'
scene.render.film_transparent = False
scene.view_settings.view_transform = 'Standard'
scene.world = bpy.data.worlds.new('Neutral daylight')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.48, .48, .48, 1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value = .45

def material(name, gray):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (gray, gray, gray, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = mat.diffuse_color
    bsdf.inputs['Roughness'].default_value = .85
    return mat

plaster = material('Clay / wall', .57)
timber = material('Clay / structural timber', .27)
roof = material('Clay / roof plane', .34)
stone = material('Clay / foundation', .40)
earth = material('Clay / ground', .30)
path_mat = material('Clay / walkable route', .47)
dark = material('Clay / openings', .085)
glass = material('Clay / window inset', .23)
actor_mat = material('Scale mannequin / 1.75 m', .62)
tree_mat = material('Trees / volume placeholders only', .24)
grid_mat = material('Metric grid / 1 m', .55)

def group(name):
    c = bpy.data.collections.new(name)
    scene.collection.children.link(c)
    return c

architecture = group('01 Cottage / true dimensions')
props = group('02 Work area / supported objects')
terrain = group('03 Ground and continuous path')
forest = group('04 Forest envelope / NOT tree design')
actor = group('05 Human scale / NOT character redesign')
grid = group('06 One metre layout grid')

def move(obj, collection):
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    collection.objects.link(obj)
    return obj

def box(name, pos, size, mat, collection=props, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    move(obj, collection)
    if bevel:
        mod = obj.modifiers.new('Small physical edge', 'BEVEL')
        mod.width = bevel
        mod.segments = 1
        obj.modifiers.new('Face normals', 'WEIGHTED_NORMAL')
    return obj

def mesh(name, vertices, faces, mat, collection=props):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    collection.objects.link(obj)
    data.materials.append(mat)
    return obj

def beam(name, a, b, width, mat=timber, collection=props):
    direction = Vector(b)-Vector(a)
    obj = box(name, (Vector(a)+Vector(b))/2, (width,width,direction.length),mat,collection)
    obj.rotation_euler = direction.to_track_quat('Z','Y').to_euler()
    return obj

def cylinder(name, a, b, radius, mat, collection=props, vertices=12):
    delta = Vector(b)-Vector(a)
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=delta.length, location=(Vector(a)+Vector(b))/2)
    obj = bpy.context.object
    obj.name = name
    obj.rotation_euler = delta.to_track_quat('Z','Y').to_euler()
    obj.data.materials.append(mat)
    return move(obj,collection)

# World convention: X right, Y deeper into clearing, Z up. Ground is Z=0.
box('Single ground plane', (0,3,-.12),(30,34,.24),earth,terrain)
cx,cy = -2.8,3.9
left,right,front,back = -4.9,-.7,2.0,5.8
box('Foundation 4.2 x 3.8 m', (cx,cy,.12),(4.2,3.8,.24),stone,architecture,.025)
# The front wall is split around the actual door and window openings.
box('Rear wall',(cx,back-.10,1.34),(4.2,.20,2.20),plaster,architecture)
for x in (left+.10,right-.10):
    box('Side wall',(x,cy,1.34),(.20,3.8,2.20),plaster,architecture)
door_x = -1.75
box('Front left pier',(-4.65,front+.10,1.34),(.50,.20,2.20),plaster,architecture)
box('Front centre pier',(-2.6625,front+.10,1.34),(.875,.20,2.20),plaster,architecture)
box('Front right pier',(-.9875,front+.10,1.34),(.575,.20,2.20),plaster,architecture)
box('Window lower wall',(-3.75,front+.10,.67),(1.30,.20,.86),plaster,architecture)
box('Window upper wall',(-3.75,front+.10,2.245),(1.30,.20,.39),plaster,architecture)
box('Door lintel wall',(door_x,front+.10,2.35),(1.05,.20,.18),plaster,architecture)
box('Door leaf 0.95 x 2.0',(door_x,front+.075,1.24),(.95,.08,2.0),timber,architecture,.015)
for x in (door_x-.53,door_x+.53):
    box('Door jamb',(x,front-.04,1.26),(.10,.16,2.04),timber,architecture)
box('Door lintel',(door_x,front-.04,2.32),(1.16,.17,.12),timber,architecture)
box('Door latch',(door_x+.33,front-.08,1.16),(.12,.045,.055),stone,architecture)
box('Threshold',(door_x,1.88,.12),(1.28,.40,.24),stone,architecture,.02)
box('Approach step',(door_x,1.52,.065),(1.38,.34,.13),stone,architecture,.02)
box('Window inset',(-3.75,front+.13,1.56),(1.22,.04,.92),glass,architecture)
for x in (-4.39,-3.11):
    box('Window jamb',(x,front-.025,1.57),(.075,.12,1.04),timber,architecture)
for z in (1.07,2.07):
    box('Window frame',(-3.75,front-.025,z),(1.35,.12,.075),timber,architecture)
box('Window mullion',(-3.75,front-.05,1.57),(.06,.09,.95),timber,architecture)
box('Window sill',(-3.75,front-.13,1.05),(1.44,.37,.10),stone,architecture)
for x in (left+.10,right-.10):
    box('Corner post',(x,front-.035,1.34),(.14,.17,2.22),timber,architecture)
box('Eave beam',(cx,front-.04,2.43),(4.32,.18,.15),timber,architecture)
# Front and rear gables share the same ridge, walls and actual roof slope.
for y in (front,back):
    mesh('Gable',[(left,y,2.44),(right,y,2.44),(cx,y,3.72)],[(0,1,2)],plaster,architecture)
    beam('Gable king post',(cx,y-.025,2.46),(cx,y-.025,3.68),.10,timber,architecture)
for edge_x in (left-.28,right+.28):
    verts=[(edge_x,front-.34,2.39),(edge_x,back+.34,2.39),(cx,back+.34,3.83),(cx,front-.34,3.83)]
    obj=mesh('Continuous roof plane',verts,[(0,1,2,3)],roof,architecture)
    mod=obj.modifiers.new('Roof thickness', 'SOLIDIFY');mod.thickness=.14
    beam('Front roof fascia',verts[0],verts[3],.16,timber,architecture)
beam('Ridge cap',(cx,front-.39,3.86),(cx,back+.39,3.86),.13,stone,architecture)
box('Chimney',(-1.35,4.7,3.4),(.42,.48,2.0),stone,architecture)
box('Chimney crown',(-1.35,4.7,4.43),(.54,.60,.12),stone,architecture)
box('Chimney dark mouth',(-1.35,4.7,4.495),(.31,.35,.015),dark,architecture)

# Physical table: 1.6 m wide, 0.7 deep, 0.8 high, with attached legs.
table_x,table_y = -2.65,-.30
box('Sorting tabletop / 0.80 m',(table_x,table_y,.75),(1.6,.70,.10),timber,props,.018)
for dx in (-.67,.67):
    for dy in (-.24,.24):
        box('Table leg',(table_x+dx,table_y+dy,.35),(.09,.09,.70),timber)
beam('Table stretcher',(table_x-.67,table_y,.25),(table_x+.67,table_y,.25),.07)
box('Sorting tray',(table_x-.22,table_y,.84),(.48,.35,.08),stone,props,.012)
box('Knife proxy',(table_x+.35,table_y-.10,.812),(.28,.06,.024),stone)
# Drying rack outside the path. Top bar is supported by two A-frames.
for x in (-4.45,-3.45):
    beam('Rack leg',(x,.5,0),(x,.80,1.25),.065)
    beam('Rack leg',(x,1.1,0),(x,.80,1.25),.065)
beam('Drying crossbar',(-4.52,.8,1.25),(-3.38,.8,1.25),.07)
for x in (-4.22,-3.94,-3.65):
    cylinder('Hanging cord',(x,.8,1.23),(x,.8,.91),.009,stone)
    cylinder('Drying bundle proxy',(x,.8,.85),(x,.8,.97),.055,roof)

# Fallen trunk touches the ground along its underside (axis height == radius).
log_a,log_b = (1.75,.65,.34),(3.65,2.1,.34)
cylinder('Fallen trunk / 2.39 m',log_a,log_b,.34,timber,vertices=14)
direction=(Vector(log_b)-Vector(log_a)).normalized()
cylinder('Cut end',Vector(log_a)-direction*.018,Vector(log_a)-direction*.025,.31,plaster,vertices=14)
cylinder('Broken branch',(2.7,1.37,.53),(2.90,1.45,1.03),.07,timber)

# A ribbon mesh in world coordinates. Width tapers only with actual perspective.
centres=[(-1.5,-7.0),(-1.20,-4.6),(-.95,-2.7),(-.92,-1.0),(-1.23,.38),(-1.75,1.35)]
verts=[]
for i,(x,y) in enumerate(centres):
    p=Vector(centres[max(0,i-1)]);q=Vector(centres[min(len(centres)-1,i+1)])
    tangent=(q-p).normalized();normal=Vector((-tangent.y,tangent.x))*.52
    verts.extend([(x+normal.x,y+normal.y,.008),(x-normal.x,y-normal.y,.008)])
mesh('Path / continuous 1.04 m ribbon',verts,[(i*2,i*2+1,i*2+3,i*2+2) for i in range(len(centres)-1)],path_mat,terrain)

# Deliberate forest envelope; these plain volumes are only spacing placeholders.
for i,(x,y,r,h) in enumerate([(-6,-1.5,.42,6.5),(5.4,.5,.43,7),(-6.8,4,.40,7.4),(5.2,5,.42,7.2),(-5.6,8,.37,6.4),(-2.5,9,.42,7.6),(.9,8.7,.34,6.5),(4,10,.40,7.4),(-8,9,.38,7.0),(7,9,.40,7.1)]):
    cylinder(f'Tree {i+1:02d} / trunk volume',(x,y,0),(x,y,h),r,tree_mat,forest,10)
    # Crowns are marked placeholder volumes, not an attempted final foliage style.
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1,location=(x,y,h-.5))
    o=bpy.context.object;o.name=f'Tree {i+1:02d} / canopy envelope ONLY';o.scale=(2.0,1.8,1.5);o.data.materials.append(tree_mat);move(o,forest)

# Human proportions, world grounded; no change to the actual approved NPC.
human_origin=Vector((3.95,-7.1,0) if NEAR else (.65,-3.0,0))
def hp(x,y,z):return human_origin+Vector((x,y,z))
for x in (-.12,.12):
    box('Mannequin boot',hp(x,-.035,.055),(.17,.28,.11),actor_mat,actor,.015)
    cylinder('Mannequin shin',hp(x,0,.11),hp(x,0,.49),.065,actor_mat,actor)
    cylinder('Mannequin thigh',hp(x,0,.49),hp(x,0,.90),.085,actor_mat,actor)
box('Mannequin pelvis',hp(0,0,.92),(.35,.24,.23),actor_mat,actor,.025)
box('Mannequin torso',hp(0,0,1.22),(.44,.26,.40),actor_mat,actor,.035)
cylinder('Mannequin neck',hp(0,0,1.42),hp(0,0,1.48),.06,actor_mat,actor)
box('Mannequin head / top 1.75 m',hp(0,-.015,1.615),(.21,.23,.27),actor_mat,actor,.03)
for side in (-1,1):
    cylinder('Mannequin upper arm',hp(side*.24,0,1.38),hp(side*.32,-.04,1.08),.065,actor_mat,actor)
    cylinder('Mannequin forearm',hp(side*.32,-.04,1.08),hp(side*.33,-.08,.83),.05,actor_mat,actor)
    box('Mannequin hand',hp(side*.33,-.08,.79),(.09,.10,.13),actor_mat,actor,.015)

for i in range(-10,13):
    box('1 m grid X',(i,2,.013),(.008,24,.003),grid_mat,grid)
    box('1 m grid Y',(0,i,.013),(24,.008,.003),grid_mat,grid)
grid.hide_render=True

def camera(name,position,target,lens=39):
    data=bpy.data.cameras.new(name);obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj)
    obj.location=position;obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
    data.lens=lens;data.clip_end=100;return obj

cam=camera('MAIN / eye height 1.70 m / locked',(6.6,-12.8,1.7),(-.45,2.1,1.7),55)
scene.camera=cam
light_data=bpy.data.lights.new('Large neutral key','AREA');light=bpy.data.objects.new('Large neutral key',light_data);scene.collection.objects.link(light)
light.location=(-3,-4,10);light.rotation_euler=(Vector((0,2,0))-light.location).to_track_quat('-Z','Y').to_euler();light_data.energy=1800;light_data.shape='DISK';light_data.size=5

def projection(p):
    v=world_to_camera_view(scene,scene.camera,Vector(p))
    return [round(v.x*480,3),round((1-v.y)*512,3)]

def bounds(points):
    p=[projection(v) for v in points];xs=[v[0] for v in p];ys=[v[1] for v in p]
    return [min(xs),min(ys),max(xs)-min(xs),max(ys)-min(ys)]

render_cameras=[]
def render(filename):
    render_cameras.append((filename,scene.camera.name))
    scene.render.filepath=str(OUT/filename);bpy.ops.render.render(write_still=True)

scene.camera=cam;bpy.context.view_layer.update()
metadata={'id':VERSION,'status':'layout-candidate','units':'metres','camera':{'position':list(cam.location),'target':[-.45,2.1,1.7],'lensMm':cam.data.lens,'projection':'perspective','render':[960,1024]},
 'dimensions':{'personHeight':1.75,'doorHeight':2.0,'doorWidth':.95,'tableHeight':.80,'tableWidth':1.60,'cottageFootprint':[4.2,3.8],'ridgeHeight':3.83,'pathWidth':1.04},
 'actor':{'feet':projection(hp(0,0,0)),'head':projection(hp(0,0,1.75))},
 'anchors':[
  {'id':'door','name':'Door / 0.95 × 2.00 m','point':projection((door_x,1.95,1.24)),'rect':bounds([(door_x-.6,1.85,.2),(door_x+.6,1.85,.2),(door_x-.6,1.85,2.4),(door_x+.6,1.85,2.4)]),'text':'The continuous path reaches a supported step and the real front-wall opening.'},
  {'id':'table','name':'Work table / 0.80 m high','point':projection((table_x,table_y,.80)),'rect':bounds([(table_x+x,table_y+y,z) for x in (-.8,.8) for y in (-.35,.35) for z in (0,.8)]),'text':'A 1.60 × 0.70 m tabletop and four ground-contact legs. Kept outside the walking route.'},
  {'id':'log','name':'Fallen trunk / ground contact','point':projection((2.65,1.37,.34)),'rect':bounds([(x,y,z) for x,y in [(1.5,.4),(3.9,2.35)] for z in (0,.72)]),'text':'The trunk radius is 0.34 m and its axis is 0.34 m above the same ground plane.'},
  {'id':'human','name':'Human scale / 1.75 m','point':projection(hp(0,0,1.1)),'rect':bounds([hp(x,0,z) for x in (-.4,.4) for z in (0,1.75)]),'text':'This neutral mannequin is a ruler for the scene, not new character art.'}]}
render('perspective.png')
actor.hide_render=True;render('environment.png');actor.hide_render=False
grid.hide_render=False;render('metric-grid.png');grid.hide_render=True
plan=camera('PLAN / diagnostic only',(0,1,24),(0,1,0),50);plan.data.type='ORTHO';plan.data.ortho_scale=18
scene.camera=plan;forest.hide_render=True;grid.hide_render=False
metadata['planAnchors']=[{'id':key,'point':projection(pos)} for key,pos in [('door',(door_x,1.95,1.24)),('table',(table_x,table_y,.8)),('log',(2.65,1.37,.34)),('human',hp(0,0,1.1))]]
table_legs=[o for o in props.objects if o.name.startswith('Table leg')]
metadata['checks']={'pathMeetsStep':abs(centres[-1][1]-(1.52-.34/2))<1e-6,
 'tableLegsOnGround':len(table_legs)==4 and all(abs(min((o.matrix_world@Vector(v)).z for v in o.bound_box))<1e-5 for o in table_legs),
 'trunkAxisEqualsRadius':log_a[2]==.34 and log_b[2]==.34,
 'samePerspectiveCameraForAllMainViews':len(render_cameras)==3 and all(name==cam.name for _,name in render_cameras)}
assert all(metadata['checks'].values()),metadata['checks']
render('plan.png')
forest.hide_render=False;grid.hide_render=True;scene.camera=cam
bpy.context.view_layer.update()
for obj in bpy.context.selected_objects:obj.select_set(False)
cam.select_set(True);bpy.context.view_layer.objects.active=cam
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':area.spaces.active.region_3d.view_perspective='CAMERA'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/('gatherer-near-v3.blend' if NEAR else 'gatherer-clearing-v2.blend')))
(OUT/'layout.json').write_text(json.dumps(metadata,indent=2),encoding='utf8')
(OUT/'layout.js').write_text('window.KR_GATHERER_BLOCKOUT = '+json.dumps(metadata,indent=2)+';\n',encoding='utf8')
print('GATHERER_BLOCKOUT_READY',str(OUT))
