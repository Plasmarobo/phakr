

/**
* @author       Austen Higgins-Cassidy <plasmarobo@gmail.com>
* @copyright    2020 Millibyte Studios
* @license      {@link https://github.com/photonstorm/phaser3-plugin-template/blob/master/LICENSE|MIT License}
*/
import { EntityManager } from './entity_manager'

class PhakrSystem
{
    constructor(core, components)
    {
        this.core = core
        this.components = components
    }

    update(time, delta_t, entity) {}

    onRegister() {}
}

class PhakrCore
{
    constructor(scene, component_list)
    {
        this.scene = scene
        this._systems = {}
        
        var count = component_list.length

        var Cs = new Array(count)
        for (var i = 0; i < Cs.length; i++) {
            Cs[i] = component_list[i]
        }

        var components = new Components(Cs)
        var storage = new ContiguousStorage(components)

        this.ecsmanager = new EntityManager(components, storage)
        if (!scene.sys.settings.isBooted)
        {
            scene.sys.events.once('boot', this.boot, this)
        }
    }

    static register = function (PluginManager)
    {
        PluginManager.register('PhakrCore', PhakrCore, 'phakr')
    }

    boot()
    {
        var eventEmitter = this.scene.sys.events
        eventEmitter.on('update', this.update, this)
        eventEmitter.on('shutdown', this.shutdown, this)
        eventEmitter.on('destroy', this.destroy, this)   
    }

    //  Called every Scene step - phase 2
    update(time, delta)
    {
        for (let system of this._systems)
        {
            var entities = this.queryEntities(system.components)
            for(var entity of entities)
            {
                system.update(time, delta, entity)
            }
        }
    }
    //  Called when a Scene shuts down, it may then come back again later (which will invoke the 'start' event) but should be considered dormant.
    shutdown()
    {
    }
    
    destroy()
    {
        this.shutdown();

        this.scene = undefined;
    }

    createEntity()
    {
        let e = this.ecsmanager.create()
        let Cs = new Array(arguments.length) 
        for(var i = 0; i < Cs.length; i++)
        {
            e.add(arguments[i])
        }

        return e
    }

    queryEntities()
    {
        return this.ecsmanager.query(arguments)
    }

    getEntity(id)
    {
        return this.ecsmanager.get(id)
    }

    valid(id)
    {
        return this.ecsmanager.valid(id)
    }

    registerSystem(system)
    {
        if (this._systems.indexOf(system) >= 0) {
            throw "Cannot register a system twice"
        }
        
        this._systems.push(system)
        
        system.onRegister();
    }

    clearSystems()
    {
        this._systems.clear()
    }

};

module.exports = { PhakrCore, PhakrSystem };
