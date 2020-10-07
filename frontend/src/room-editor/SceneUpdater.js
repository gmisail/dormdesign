class SceneUpdater {
  constructor(scene) {
    this.scene = scene;
  }

  updateSceneObjects(updatedObjects) {
    for (let i = 0; i < updatedObjects.length; i++) {
      const updated = updatedObjects[i];
      const obj = this.scene.objects.get(updated.id);
      if (obj) {
        obj.position = updated.position;
      }
    }
  }
}

export default SceneUpdater;
